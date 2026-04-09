import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";
import { createNotification } from "@/lib/notifications";
import { sendRetestCompletedEmail } from "@/lib/email";
import { scenarios } from "@/lib/scenarios";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { retest_result, retest_notes } = body;

  if (!retest_result || !["pass", "fail"].includes(retest_result)) {
    return NextResponse.json(
      { error: "retest_result must be 'pass' or 'fail'" },
      { status: 400 }
    );
  }

  const { data: retestReq } = await supabase
    .from("retest_requests")
    .select("*, requester:testers!retest_requests_requested_by_fkey(id, name)")
    .eq("id", id)
    .eq("tester_id", tester!.id)
    .single();

  if (!retestReq) {
    return NextResponse.json({ error: "Retest request not found" }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from("retest_requests")
    .update({
      status: "completed",
      retest_result,
      retest_notes: retest_notes || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const newStatus = retest_result === "pass" ? "retest_pass" : "retest_fail";
  await supabase
    .from("test_results")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("tester_id", tester!.id)
    .eq("check_id", retestReq.check_id);

  await supabase
    .from("defect_lifecycle")
    .update({
      status: newStatus,
      retest_result,
      retest_notes: retest_notes || null,
      retested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("tester_id", tester!.id)
    .eq("check_id", retestReq.check_id);

  let checkText = retestReq.check_id;
  for (const s of scenarios) {
    for (const step of s.steps) {
      const c = step.checks.find((ch) => ch.id === retestReq.check_id);
      if (c) { checkText = c.text; break; }
    }
  }

  if (retestReq.requester) {
    const verb = retest_result === "pass" ? "confirmed fix" : "reports still failing";
    await createNotification({
      testerId: retestReq.requester.id,
      type: "retest_completed",
      title: `${tester!.name} ${verb}: ${checkText.slice(0, 60)}`,
      body: retest_notes || undefined,
      link: `/admin/tester/${tester!.id}`,
    });

    const { data: requesterRow } = await supabase
      .from("testers")
      .select("email")
      .eq("id", retestReq.requester.id)
      .single();

    sendRetestCompletedEmail({
      testerName: tester!.name,
      testerId: tester!.id,
      checkpointText: checkText,
      result: retest_result as "pass" | "fail",
      retestNotes: retest_notes || null,
      whatToVerify: retestReq.what_to_verify || "",
      adminEmail: requesterRow?.email ?? null,
    }).catch((err) => console.error("Retest completed email failed:", err));
  }

  return NextResponse.json({ retestRequest: data });
}
