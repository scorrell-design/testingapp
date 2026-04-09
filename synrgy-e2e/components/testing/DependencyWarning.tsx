"use client";

import { scenarios } from "@/lib/scenarios";

type ResultMap = Record<string, { status: string }>;

function findCheckText(checkId: string): string {
  for (const s of scenarios) {
    for (const step of s.steps) {
      const c = step.checks.find((ch) => ch.id === checkId);
      if (c) return c.text;
    }
  }
  return checkId;
}

export default function DependencyWarning({
  dependsOn,
  results,
}: {
  dependsOn: string[];
  results: ResultMap;
}) {
  if (dependsOn.length === 0) return null;

  const deps = dependsOn.map((depId) => {
    const result = results[depId];
    const text = findCheckText(depId);
    const status = result?.status ?? "untested";
    return { id: depId, text, status };
  });

  const allPassed = deps.every(
    (d) => d.status === "pass" || d.status === "retest_pass"
  );
  const anyFailed = deps.some(
    (d) => d.status === "fail" || d.status === "retest_fail"
  );
  const anyUntested = deps.some((d) => d.status === "untested");

  if (allPassed) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5">
        <span className="text-xs text-emerald-700">✓ Prerequisites passed — ready to test</span>
      </div>
    );
  }

  if (anyFailed) {
    return (
      <div className="rounded-lg bg-amber-50 px-3 py-2 space-y-1">
        <p className="text-xs font-medium text-amber-800">
          ⚠ Dependency failed — this test may not be reachable
        </p>
        {deps
          .filter((d) => d.status === "fail" || d.status === "retest_fail")
          .map((d) => (
            <p key={d.id} className="text-[11px] text-amber-700">
              {d.id}: {d.text.slice(0, 80)}… — <span className="font-medium">failed</span>
            </p>
          ))}
        <p className="text-[10px] text-amber-600">You can still attempt this test or mark as Blocked.</p>
      </div>
    );
  }

  if (anyUntested) {
    return (
      <div className="rounded-lg bg-gray-50 px-3 py-2 space-y-1">
        <p className="text-xs text-gray-600">
          ⏳ Prerequisites pending
        </p>
        {deps
          .filter((d) => d.status === "untested")
          .map((d) => (
            <p key={d.id} className="text-[10px] text-gray-500">
              {d.id}: {d.text.slice(0, 80)}…
            </p>
          ))}
      </div>
    );
  }

  return null;
}
