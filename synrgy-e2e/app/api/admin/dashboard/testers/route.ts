import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data: testers } = await supabase
    .from("testers")
    .select("id, name, email, role, created_at")
    .order("name");

  const { data: allResults } = await supabase
    .from("test_results")
    .select("tester_id, check_id, status, updated_at");

  const { data: allAssignments } = await supabase
    .from("assignments")
    .select("tester_id, scenario_id, persona, status");

  const resultsByTester: Record<
    string,
    Array<{ check_id: string; status: string; updated_at: string }>
  > = {};
  for (const r of allResults ?? []) {
    if (!resultsByTester[r.tester_id]) resultsByTester[r.tester_id] = [];
    resultsByTester[r.tester_id].push(r);
  }

  const assignmentsByTester: Record<
    string,
    Array<{ scenario_id: string; persona: string; status: string }>
  > = {};
  for (const a of allAssignments ?? []) {
    if (!assignmentsByTester[a.tester_id]) assignmentsByTester[a.tester_id] = [];
    assignmentsByTester[a.tester_id].push(a);
  }

  const enriched = (testers ?? []).map((t) => {
    const results = resultsByTester[t.id] ?? [];
    const assignments = assignmentsByTester[t.id] ?? [];
    const passed = results.filter(
      (r) => r.status === "pass" || r.status === "retest_pass"
    ).length;
    const failed = results.filter(
      (r) => r.status === "fail" || r.status === "retest_fail"
    ).length;
    const blocked = results.filter((r) => r.status === "blocked").length;
    const skipped = results.filter((r) => r.status === "skip").length;
    const lastActive = results.length > 0
      ? results.reduce((latest, r) =>
          r.updated_at > latest ? r.updated_at : latest, results[0].updated_at)
      : null;

    return {
      ...t,
      totalTested: results.length,
      passed,
      failed,
      blocked,
      skipped,
      lastActive,
      assignments,
    };
  });

  return NextResponse.json({ testers: enriched });
}
