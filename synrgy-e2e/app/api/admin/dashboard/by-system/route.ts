import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { scenarios } from "@/lib/scenarios";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const platformFilter = searchParams.get("platform");
  const statusFilter = searchParams.get("status");
  const testerFilter = searchParams.get("tester_id");

  const { data: allResults } = await supabase
    .from("test_results")
    .select("tester_id, check_id, status, notes, updated_at");

  const { data: allTesters } = await supabase
    .from("testers")
    .select("id, name, email");

  const testerMap: Record<string, { name: string; email: string }> = {};
  for (const t of allTesters ?? []) {
    testerMap[t.id] = { name: t.name, email: t.email };
  }

  const resultsByCheck: Record<
    string,
    Array<{ tester_id: string; status: string; notes: string | null; updated_at: string }>
  > = {};
  for (const r of allResults ?? []) {
    if (!resultsByCheck[r.check_id]) resultsByCheck[r.check_id] = [];
    resultsByCheck[r.check_id].push(r);
  }

  type SystemGroup = {
    platform: string;
    checkpoints: Array<{
      checkId: string;
      text: string;
      scenarioId: string;
      scenarioTitle: string;
      stepTitle: string;
      results: Array<{
        testerId: string;
        testerName: string;
        status: string;
        notes: string | null;
      }>;
      aggregateStatus: "all_pass" | "any_fail" | "mixed" | "untested";
    }>;
  };

  const platformMap = new Map<string, SystemGroup["checkpoints"]>();

  for (const scenario of scenarios) {
    for (const step of scenario.steps) {
      const platform = step.platform;
      if (platformFilter && platform !== platformFilter) continue;

      if (!platformMap.has(platform)) platformMap.set(platform, []);

      for (const check of step.checks) {
        const checkResults = (resultsByCheck[check.id] ?? [])
          .filter((r) => !testerFilter || r.tester_id === testerFilter)
          .filter((r) => !statusFilter || r.status === statusFilter)
          .map((r) => ({
            testerId: r.tester_id,
            testerName: testerMap[r.tester_id]?.name ?? "Unknown",
            status: r.status,
            notes: r.notes,
          }));

        const hasPass = checkResults.some((r) =>
          r.status === "pass" || r.status === "retest_pass"
        );
        const hasFail = checkResults.some((r) =>
          r.status === "fail" || r.status === "retest_fail"
        );

        let aggregateStatus: "all_pass" | "any_fail" | "mixed" | "untested" = "untested";
        if (checkResults.length > 0) {
          if (hasFail) aggregateStatus = "any_fail";
          else if (hasPass) aggregateStatus = "all_pass";
          else aggregateStatus = "mixed";
        }

        if (statusFilter && checkResults.length === 0) continue;

        platformMap.get(platform)!.push({
          checkId: check.id,
          text: check.text,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          stepTitle: step.title,
          results: checkResults,
          aggregateStatus,
        });
      }
    }
  }

  const systems: SystemGroup[] = [];
  for (const [platform, checkpoints] of platformMap) {
    systems.push({ platform, checkpoints });
  }
  systems.sort((a, b) => b.checkpoints.length - a.checkpoints.length);

  const platforms = [...new Set(scenarios.flatMap((s) => s.steps.map((st) => st.platform)))];

  return NextResponse.json({ systems, platforms, testers: allTesters ?? [] });
}
