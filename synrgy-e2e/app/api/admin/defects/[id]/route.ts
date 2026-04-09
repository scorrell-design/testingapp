import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sendRetestRequestedEmail } from "@/lib/email";
import { scenarios } from "@/lib/scenarios";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, tester: admin } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { status, admin_notes } = await request.json();

  if (!status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const { data: defect } = await supabase
    .from("defect_lifecycle")
    .select("*, tester:testers!defect_lifecycle_tester_id_fkey(id, name, email)")
    .eq("id", id)
    .single();

  if (!defect) {
    return NextResponse.json({ error: "Defect not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  const { data, error: dbError } = await supabase
    .from("defect_lifecycle")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (status === "ready_for_retest" && defect.tester) {
    await supabase
      .from("test_results")
      .update({ status: "ready_for_retest", updated_at: new Date().toISOString() })
      .eq("tester_id", defect.tester_id)
      .eq("check_id", defect.check_id);

    let checkText = defect.check_id;
    const scenario = scenarios.find((s) => s.id === defect.scenario_id);
    if (scenario) {
      for (const step of scenario.steps) {
        const c = step.checks.find((ch) => ch.id === defect.check_id);
        if (c) { checkText = c.text; break; }
      }
    }

    await supabase.from("retest_requests").insert({
      tester_id: defect.tester_id,
      check_id: defect.check_id,
      scenario_id: defect.scenario_id,
      requested_by: admin!.id,
      reason: admin_notes || "A fix has been deployed",
      what_to_verify: checkText,
      original_status: "fail",
      original_notes: defect.original_notes,
      priority: "normal",
    });

    sendRetestRequestedEmail({
      testerEmail: defect.tester.email,
      testerName: defect.tester.name,
      adminName: admin!.name,
      checkpointText: checkText,
      reason: admin_notes || "A fix has been deployed",
      whatToVerify: checkText,
      originalNotes: defect.original_notes,
      scenarioId: defect.scenario_id,
      stepIndex: defect.step_index,
      checkId: defect.check_id,
    }).catch((err) => console.error("Retest email failed:", err));
  }

  return NextResponse.json({ defect: data });
}
