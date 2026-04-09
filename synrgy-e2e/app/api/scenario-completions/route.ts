import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";
import { sendCompletionEmail } from "@/lib/email";
import { scenarios } from "@/lib/scenarios";

export async function GET() {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { data } = await supabase
    .from("scenario_completions")
    .select("scenario_id, pass_count, fail_count, blocked_count, skip_count, final_notes, completed_at")
    .eq("tester_id", tester!.id);

  return NextResponse.json({ completions: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { scenario_id, pass_count, fail_count, blocked_count, skip_count, final_notes } =
    await request.json();

  if (!scenario_id) {
    return NextResponse.json({ error: "scenario_id required" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("scenario_completions")
    .upsert(
      {
        tester_id: tester!.id,
        scenario_id,
        pass_count: pass_count ?? 0,
        fail_count: fail_count ?? 0,
        blocked_count: blocked_count ?? 0,
        skip_count: skip_count ?? 0,
        final_notes: final_notes || null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "tester_id,scenario_id" }
    )
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (final_notes) {
    await supabase.from("test_notes").insert({
      tester_id: tester!.id,
      scenario_id,
      step_index: -1,
      note: final_notes,
    });
  }

  const scenario = scenarios.find((s) => s.id === scenario_id);
  if (scenario) {
    const { data: assignment } = await supabase
      .from("assignments")
      .select("assigned_by")
      .eq("tester_id", tester!.id)
      .eq("scenario_id", scenario_id)
      .single();

    let assignerEmail: string | null = null;
    if (assignment?.assigned_by) {
      const { data: assigner } = await supabase
        .from("testers")
        .select("email")
        .eq("id", assignment.assigned_by)
        .single();
      assignerEmail = assigner?.email ?? null;
    }

    sendCompletionEmail({
      testerName: tester!.name,
      testerEmail: tester!.email,
      testerId: tester!.id,
      scenarioTitle: scenario.title,
      passed: pass_count ?? 0,
      failed: fail_count ?? 0,
      blocked: blocked_count ?? 0,
      skipped: skip_count ?? 0,
      total: (pass_count ?? 0) + (fail_count ?? 0) + (blocked_count ?? 0) + (skip_count ?? 0),
      failedChecks: [],
      assignerEmail,
    }).catch((err) => console.error("Completion email failed:", err));
  }

  return NextResponse.json({ completion: data });
}
