"use client";

import type { Step } from "@/lib/scenarios";
import PathBadge from "./PathBadge";

type ResultMap = Record<string, { status: string }>;

type StepStatus = "incomplete" | "allPass" | "hasFail";

const FAIL_STATUSES = ["fail", "retest_fail"];
const PASS_STATUSES = ["pass", "retest_pass"];

function getStepStatus(step: Step, results: ResultMap): StepStatus {
  const checkIds = step.checks.map((c) => c.id);
  const tested = checkIds.filter((id) => results[id]);
  if (tested.length === 0) return "incomplete";

  const hasFail = checkIds.some((id) => FAIL_STATUSES.includes(results[id]?.status));
  if (hasFail) return "hasFail";

  const allTested = tested.length === checkIds.length;
  const allPass = checkIds.every((id) => PASS_STATUSES.includes(results[id]?.status));
  if (allTested && allPass) return "allPass";

  return "incomplete";
}

export default function StepPill({
  step,
  stepIndex,
  isActive,
  scenarioColor,
  results,
  onClick,
  dimmed,
}: {
  step: Step;
  stepIndex: number;
  isActive: boolean;
  scenarioColor: string;
  results: ResultMap;
  onClick: () => void;
  dimmed?: boolean;
}) {
  const status = getStepStatus(step, results);

  return (
    <button
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap"
      style={
        isActive
          ? {
              borderColor: scenarioColor,
              backgroundColor: scenarioColor + "12",
              color: scenarioColor,
              opacity: dimmed ? 0.5 : 1,
            }
          : {
              borderColor: "#e5e7eb",
              backgroundColor: "transparent",
              color: "#6b7280",
              opacity: dimmed ? 0.5 : 1,
            }
      }
    >
      {status === "allPass" && (
        <svg className="h-3 w-3 text-status-pass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "hasFail" && (
        <svg className="h-3 w-3 text-status-fail" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{stepIndex + 1}. {step.title}</span>
      <PathBadge path={step.path} size="xs" />
    </button>
  );
}
