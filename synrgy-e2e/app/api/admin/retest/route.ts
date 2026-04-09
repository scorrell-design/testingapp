import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { createNotification, sendRetestEmail, sendSlackNotification } from "@/lib/notifications";
import { scenarios } from "@/lib/scenarios";

export async function POST(request: NextRequest) {
  const { error, tester: admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const {
    tester_id,
    check_id,
    scenario_id,
    reason,
    what_to_verify,
    original_status,
    original_notes,
    priority,
  } = body;

  if (!tester_id || !check_id || !scenario_id || !reason || !what_to_verify) {
    return NextResponse.json(
      { error: "tester_id, check_id, scenario_id, reason, and what_to_verify are required" },
      { status: 400 }
    );
  }

  const { data: retestReq, error: dbError } = await supabase
    .from("retest_requests")
    .insert({
      tester_id,
      check_id,
      scenario_id,
      requested_by: admin!.id,
      reason,
      what_to_verify,
      original_status: original_status || null,
      original_notes: original_notes || null,
      priority: priority || "normal",
    })
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  let checkText = check_id;
  for (const s of scenarios) {
    for (const step of s.steps) {
      const c = step.checks.find((ch) => ch.id === check_id);
      if (c) { checkText = c.text; break; }
    }
  }

  const appLink = `/scenario/${scenario_id}?retest=${check_id}`;

  await createNotification({
    testerId: tester_id,
    type: "retest_request",
    title: `Retest requested: ${checkText.slice(0, 80)}`,
    body: `${admin!.name} has requested you retest this checkpoint. ${reason}`,
    link: appLink,
  });

  const { data: targetTester } = await supabase
    .from("testers")
    .select("name, email")
    .eq("id", tester_id)
    .single();

  if (targetTester) {
    sendRetestEmail({
      testerEmail: targetTester.email,
      testerName: targetTester.name,
      adminName: admin!.name,
      checkpointText: checkText,
      reason,
      whatToVerify: what_to_verify,
      originalNotes: original_notes || null,
      appLink: `${process.env.NEXT_PUBLIC_APP_URL || ""}${appLink}`,
    }).catch((err) => console.error("Email send failed:", err));

    sendSlackNotification({
      text: `🔄 *Retest requested* by ${admin!.name}\n*Tester:* ${targetTester.name}\n*Checkpoint:* ${checkText}\n*What was fixed:* ${reason}`,
    }).catch((err) => console.error("Slack send failed:", err));
  }

  return NextResponse.json({ retestRequest: retestReq });
}
