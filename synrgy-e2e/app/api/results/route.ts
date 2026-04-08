import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie, getCurrentTester } from "@/lib/auth";
import {
  syncCheckpointToSheet,
  clearCheckpointOnSheet,
  getAllTesterResults,
  syncSummaryTab,
} from "@/lib/google-sheets";

export async function GET() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("test_results")
    .select("check_id, status, notes, updated_at")
    .eq("tester_id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Record<
    string,
    { status: string; notes: string | null; updated_at: string }
  > = {};
  for (const row of data ?? []) {
    results[row.check_id] = {
      status: row.status,
      notes: row.notes,
      updated_at: row.updated_at,
    };
  }

  return NextResponse.json({ results });
}

export async function PUT(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { check_id, status, notes } = await request.json();

  if (!check_id || !status) {
    return NextResponse.json(
      { error: "check_id and status are required" },
      { status: 400 }
    );
  }

  const validStatuses = ["pass", "fail", "blocked", "skip"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("test_results")
    .upsert(
      {
        tester_id: testerId,
        check_id,
        status,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tester_id,check_id" }
    )
    .select("check_id, status, notes, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tester = await getCurrentTester();
  if (tester) {
    syncCheckpointToSheet(tester.name, check_id, status, notes)
      .catch((err) => console.error("Sheets sync failed:", err));
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

  const { error } = await supabase
    .from("test_results")
    .delete()
    .eq("tester_id", testerId)
    .eq("check_id", check_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tester = await getCurrentTester();
  if (tester) {
    clearCheckpointOnSheet(tester.name, check_id)
      .then(() => getAllTesterResults())
      .then((all) => syncSummaryTab(all))
      .catch((err) => console.error("Sheets sync failed:", err));
  }

  return NextResponse.json({ ok: true });
}
