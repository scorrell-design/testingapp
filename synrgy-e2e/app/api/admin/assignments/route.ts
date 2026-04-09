import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sendAssignmentEmail, createNotification } from "@/lib/notifications";
import { scenarios } from "@/lib/scenarios";

export async function GET() {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("assignments")
    .select(`
      id, scenario_id, persona, notes, status, created_at, updated_at,
      tester:testers!assignments_tester_id_fkey(id, name, email),
      assigner:testers!assignments_assigned_by_fkey(id, name)
    `)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { tester_email, tester_name, scenario_ids, persona, notes } = body;

  if (!tester_email || !scenario_ids?.length || !persona) {
    return NextResponse.json(
      { error: "tester_email, scenario_ids, and persona are required" },
      { status: 400 }
    );
  }

  const normalizedEmail = tester_email.trim().toLowerCase();

  let { data: targetTester } = await supabase
    .from("testers")
    .select("id, name, email")
    .eq("email", normalizedEmail)
    .single();

  if (!targetTester) {
    const { data: created, error: createError } = await supabase
      .from("testers")
      .insert({
        name: tester_name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
      })
      .select("id, name, email")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    targetTester = created;
  }

  const assignments = scenario_ids.map((sid: string) => ({
    tester_id: targetTester!.id,
    scenario_id: sid,
    persona,
    assigned_by: tester!.id,
    notes: notes || null,
    status: "assigned",
  }));

  const { data, error: insertError } = await supabase
    .from("assignments")
    .upsert(assignments, { onConflict: "tester_id,scenario_id" })
    .select("id, scenario_id, persona, notes, status, created_at");

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  for (const sid of scenario_ids as string[]) {
    const scenario = scenarios.find((s) => s.id === sid);
    const scenarioTitle = scenario?.title || sid;

    sendAssignmentEmail({
      testerEmail: targetTester!.email,
      testerName: targetTester!.name,
      scenarioTitle,
      adminNotes: notes || null,
    }).catch((err) => console.error("Assignment email failed:", err));

    createNotification({
      testerId: targetTester!.id,
      type: "assignment",
      title: `New assignment: ${scenarioTitle}`,
      body: `${tester!.name} assigned you to test "${scenarioTitle}"${notes ? `. Notes: ${notes}` : ""}`,
      link: `/scenario/${sid}`,
    }).catch((err) => console.error("Assignment notification failed:", err));
  }

  return NextResponse.json({ assignments: data ?? [] });
}
