import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { getTotalCheckCount } from "@/lib/scenarios";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const totalPossible = getTotalCheckCount();

  const { data: results } = await supabase
    .from("test_results")
    .select("id, status, tester_id, updated_at");

  const allResults = results ?? [];
  const totalTested = allResults.length;
  const passCount = allResults.filter(
    (r) => r.status === "pass" || r.status === "retest_pass"
  ).length;
  const failCount = allResults.filter(
    (r) => r.status === "fail" || r.status === "retest_fail"
  ).length;
  const passRate = totalTested > 0 ? Math.round((passCount / totalTested) * 100) : 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const activeTesters = new Set(
    allResults
      .filter((r) => r.updated_at && r.updated_at >= sevenDaysAgo)
      .map((r) => r.tester_id)
  ).size;

  return NextResponse.json({
    totalTested,
    totalPossible,
    passRate,
    failCount,
    activeTesters,
  });
}
