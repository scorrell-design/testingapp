import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie, getCurrentTester } from "@/lib/auth";
import {
  syncCheckpointToSheet,
  clearCheckpointOnSheet,
  getAllTesterResults,
  syncSummaryTab,
} from "@/lib/google-sheets";

const VALID_STATUSES = [
  "pass", "fail", "blocked", "skip",
  "acknowledged", "fix_in_progress", "ready_for_retest",
  "retest_pass", "retest_fail",
];

export async function GET(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roundParam = searchParams.get("round");
  const allRounds = searchParams.get("all_rounds") === "true";

  const { data: tester } = await supabase
    .from("testers")
    .select("current_round")
    .eq("id", testerId)
    .single();

  const currentRound = tester?.current_round ?? 1;

  if (allRounds) {
    const { data, error } = await supabase
      .from("test_results")
      .select("check_id, status, notes, updated_at, round, severity, defect_description, acknowledged_by, acknowledged_at, device")
      .eq("tester_id", testerId)
      .order("round", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data ?? [], current_round: currentRound });
  }

  const round = roundParam ? parseInt(roundParam) : currentRound;

  const { data, error } = await supabase
    .from("test_results")
    .select("check_id, status, notes, updated_at, round, severity, defect_description, acknowledged_by, acknowledged_at, device")
    .eq("tester_id", testerId)
    .eq("round", round);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Record<
    string,
    {
      status: string;
      notes: string | null;
      updated_at: string;
      round: number;
      severity: string | null;
      defect_description: string | null;
      acknowledged_by: string | null;
      acknowledged_at: string | null;
      device: string | null;
    }
  > = {};

  for (const row of data ?? []) {
    results[row.check_id] = {
      status: row.status,
      notes: row.notes,
      updated_at: row.updated_at,
      round: row.round,
      severity: row.severity,
      defect_description: row.defect_description,
      acknowledged_by: row.acknowledged_by,
      acknowledged_at: row.acknowledged_at,
      device: row.device,
    };
  }

  // For rounds > 1, carry forward "pass" results from previous rounds
  // for checkpoints that haven't been re-tested
  if (round > 1) {
    const { data: prevData } = await supabase
      .from("test_results")
      .select("check_id, status, notes, updated_at, round, severity, defect_description, acknowledged_by, acknowledged_at, device")
      .eq("tester_id", testerId)
      .lt("round", round)
      .in("status", ["pass", "retest_pass"])
      .order("round", { ascending: false });

    for (const row of prevData ?? []) {
      if (!results[row.check_id]) {
        results[row.check_id] = {
          status: row.status,
          notes: row.notes,
          updated_at: row.updated_at,
          round: row.round,
          severity: row.severity,
          defect_description: row.defect_description,
          acknowledged_by: row.acknowledged_by,
          acknowledged_at: row.acknowledged_at,
          device: row.device,
        };
      }
    }
  }

  // Get previous round results for "ready_for_retest" items
  let previousRoundResults: Record<string, { status: string; round: number }> = {};
  if (round > 1) {
    const { data: prevRound } = await supabase
      .from("test_results")
      .select("check_id, status, round")
      .eq("tester_id", testerId)
      .eq("round", round - 1)
      .eq("status", "ready_for_retest");

    for (const row of prevRound ?? []) {
      previousRoundResults[row.check_id] = { status: row.status, round: row.round };
    }
  }

  return NextResponse.json({
    results,
    current_round: currentRound,
    previous_round_results: previousRoundResults,
  });
}

export async function PUT(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { check_id, status, notes, severity, defect_description, device } = body;

  if (!check_id || !status) {
    return NextResponse.json(
      { error: "check_id and status are required" },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if ((status === "fail" || status === "retest_fail") && (!severity || !defect_description)) {
    return NextResponse.json(
      { error: "severity and defect_description are required for fail status" },
      { status: 400 }
    );
  }

  const { data: tester } = await supabase
    .from("testers")
    .select("current_round, name")
    .eq("id", testerId)
    .single();

  const currentRound = tester?.current_round ?? 1;
  const testerName = tester?.name ?? "";

  const upsertData: Record<string, unknown> = {
    tester_id: testerId,
    check_id,
    status,
    round: currentRound,
    notes: notes ?? null,
    updated_at: new Date().toISOString(),
    device: device ?? null,
  };

  if (status === "fail" || status === "retest_fail") {
    upsertData.severity = severity;
    upsertData.defect_description = defect_description;
  }

  if (status === "acknowledged") {
    upsertData.acknowledged_by = testerName;
    upsertData.acknowledged_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("test_results")
    .upsert(upsertData, { onConflict: "tester_id,check_id,round" })
    .select("check_id, status, notes, updated_at, round, severity, defect_description, acknowledged_by, acknowledged_at, device")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (testerName) {
    syncCheckpointToSheet(testerName, check_id, status, notes)
      .catch((err: unknown) => console.error("Sheets sync failed:", err));
  }

  return NextResponse.json({ result: data });
}

export async function DELETE(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { check_id } = await request.json();

  if (!check_id) {
    return NextResponse.json(
      { error: "check_id is required" },
      { status: 400 }
    );
  }

  const { data: tester } = await supabase
    .from("testers")
    .select("current_round, name")
    .eq("id", testerId)
    .single();

  const currentRound = tester?.current_round ?? 1;

  const { error } = await supabase
    .from("test_results")
    .delete()
    .eq("tester_id", testerId)
    .eq("check_id", check_id)
    .eq("round", currentRound);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (tester?.name) {
    clearCheckpointOnSheet(tester.name, check_id)
      .then(() => getAllTesterResults())
      .then((all) => syncSummaryTab(all))
      .catch((err: unknown) => console.error("Sheets sync failed:", err));
  }

  return NextResponse.json({ ok: true });
}
