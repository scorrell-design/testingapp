"use client";

import Link from "next/link";
import type { Scenario, Path } from "@/lib/scenarios";
import { getScenarioCheckCount, getScenarioPaths, getCheckIdsForPaths } from "@/lib/scenarios";
import ProgressBar from "./ProgressBar";
import PathBadge from "./PathBadge";

type ResultMap = Record<string, { status: string }>;

export default function ScenarioCard({
  scenario,
  index,
  results,
  assignedPaths,
}: {
  scenario: Scenario;
  index: number;
  results: ResultMap;
  assignedPaths: Path[];
}) {
  const scenarioPaths = getScenarioPaths(scenario);
  const relevantCheckIds = getCheckIdsForPaths(scenario, assignedPaths);
  const totalChecks = relevantCheckIds.length;

  const allCheckIds = scenario.steps.flatMap((step) =>
    step.checks.map((c) => c.id)
  );

  const tested = relevantCheckIds.filter((id) => results[id]).length;
  const passed = relevantCheckIds.filter((id) => results[id]?.status === "pass").length;
  const failed = relevantCheckIds.filter((id) => results[id]?.status === "fail").length;
  const percent = totalChecks > 0 ? (tested / totalChecks) * 100 : 0;

  const totalAll = getScenarioCheckCount(scenario);
  const testedAll = allCheckIds.filter((id) => results[id]).length;

  return (
    <Link href={`/scenario/${scenario.id}`}>
      <div
        className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = scenario.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      >
        <div className="mb-3 flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: scenario.color }}
          >
            {scenario.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">
              Scenario {index + 1} · {scenario.persona}
            </p>
            <h3 className="text-sm font-semibold text-gray-900">
              {scenario.title}
            </h3>
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-1">
          {scenarioPaths.map((p) => (
            <PathBadge key={p} path={p} size="xs" />
          ))}
        </div>

        <p className="mb-3 text-xs leading-relaxed text-gray-500">
          {scenario.summary}
        </p>

        <ProgressBar
          percent={percent}
          color={scenario.color}
          hasFails={failed > 0}
        />

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
          <span>
            {tested}/{totalChecks} tested
          </span>
          {totalChecks !== totalAll && (
            <span className="text-gray-300">
              ({testedAll}/{totalAll} all paths)
            </span>
          )}
          {passed > 0 && (
            <span className="text-status-pass">{passed} passed</span>
          )}
          {failed > 0 && (
            <span className="text-status-fail">{failed} failed</span>
          )}
        </div>
      </div>
    </Link>
  );
}
