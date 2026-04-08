"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scenarios, getScenarioCheckCount, getCheckIdsForPaths } from "@/lib/scenarios";
import type { Scenario, Path } from "@/lib/scenarios";
import StepPill from "@/components/StepPill";
import CheckpointCard from "@/components/CheckpointCard";
import ProgressBar from "@/components/ProgressBar";
import StepNotes from "@/components/StepNotes";
import PathBadge from "@/components/PathBadge";

type ResultData = { status: string; notes: string | null; updated_at: string };
type ResultMap = Record<string, ResultData>;

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [results, setResults] = useState<ResultMap>({});
  const [assignedPaths, setAssignedPaths] = useState<Path[]>(["core"]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const scenario: Scenario | undefined = scenarios.find((s) => s.id === id);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/paths").then((r) => r.json()),
    ])
      .then(([, resultsData, pathsData]) => {
        setResults(resultsData.results ?? {});
        const paths = pathsData.paths ?? [];
        setAssignedPaths(["core", ...paths] as Path[]);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleStatusChange = useCallback(
    async (checkId: string, status: string | null, notes?: string) => {
      if (status === null) {
        setResults((prev) => {
          const next = { ...prev };
          delete next[checkId];
          return next;
        });
        fetch("/api/results", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ check_id: checkId }),
        });
      } else {
        const now = new Date().toISOString();
        setResults((prev) => ({
          ...prev,
          [checkId]: { status, notes: notes ?? null, updated_at: now },
        }));
        fetch("/api/results", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ check_id: checkId, status, notes }),
        });
      }
    },
    []
  );

  if (!scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">Scenario not found</p>
          <Link href="/dashboard" className="mt-2 text-sm text-brand-navy hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  const relevantCheckIds = getCheckIdsForPaths(scenario, assignedPaths);
  const totalChecks = relevantCheckIds.length;
  const tested = relevantCheckIds.filter((id) => results[id]).length;
  const failed = relevantCheckIds.filter((id) => results[id]?.status === "fail").length;
  const percent = totalChecks > 0 ? (tested / totalChecks) * 100 : 0;

  const totalAll = getScenarioCheckCount(scenario);
  const allCheckIds = scenario.steps.flatMap((step) => step.checks.map((c) => c.id));
  const testedAll = allCheckIds.filter((id) => results[id]).length;

  const step = scenario.steps[activeStep];
  const isStepAssigned = assignedPaths.includes(step.path);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>

          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: scenario.color }}
            >
              {scenario.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{scenario.persona}</p>
              <h1 className="text-lg font-semibold text-gray-900">
                {scenario.title}
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">
                {scenario.summary}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-gray-700">
                {tested}/{totalChecks}
              </p>
              <p className="text-xs text-gray-400">
                tested{totalChecks !== totalAll && ` (${testedAll}/${totalAll} all)`}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <ProgressBar
              percent={percent}
              color={scenario.color}
              hasFails={failed > 0}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        {/* Step pills */}
        <div className="mb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {scenario.steps.map((s, i) => (
              <StepPill
                key={i}
                step={s}
                stepIndex={i}
                isActive={activeStep === i}
                scenarioColor={scenario.color}
                results={results}
                onClick={() => setActiveStep(i)}
                dimmed={!assignedPaths.includes(s.path)}
              />
            ))}
          </div>
        </div>

        {/* Active step header */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: scenario.color }}
          >
            {activeStep + 1}
          </span>
          <h2 className="text-base font-semibold text-gray-900">
            {step.title}
          </h2>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {step.platform}
          </span>
          <PathBadge path={step.path} />
        </div>

        {/* Unassigned step notice */}
        {!isStepAssigned && (
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">
              Not assigned to you — expand to test anyway
            </p>
          </div>
        )}

        {/* Checkpoints */}
        <div
          className="space-y-3"
          style={{ opacity: isStepAssigned ? 1 : 0.6 }}
        >
          {step.checks.map((check) => (
            <CheckpointCard
              key={check.id}
              checkId={check.id}
              text={check.text}
              result={results[check.id]}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {/* Step notes */}
        <StepNotes scenarioId={scenario.id} stepIndex={activeStep} />

        {/* Previous / Next */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
          >
            ← Previous step
          </button>
          <button
            onClick={() =>
              setActiveStep((prev) =>
                Math.min(scenario.steps.length - 1, prev + 1)
              )
            }
            disabled={activeStep === scenario.steps.length - 1}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-30"
            style={{
              backgroundColor: scenario.color,
              borderColor: scenario.color,
            }}
          >
            Next step →
          </button>
        </div>
      </main>
    </div>
  );
}
