"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import type { Scenario } from "@/lib/scenarios";
import StepPill from "@/components/StepPill";
import CheckpointCardExpanded from "@/components/testing/CheckpointCardExpanded";
import type { ResultData } from "@/components/testing/CheckpointCardExpanded";
import ProgressBar from "@/components/ProgressBar";
import StepNotes from "@/components/StepNotes";
import PathBadge from "@/components/PathBadge";
import NotificationBell from "@/components/notifications/NotificationBell";

type ResultMap = Record<string, ResultData>;
type AllRoundResult = {
  check_id: string;
  status: string;
  updated_at: string;
  round: number;
  severity?: string | null;
  defect_description?: string | null;
};

type RetestRequest = {
  id: string;
  check_id: string;
  reason: string;
  what_to_verify: string;
  original_notes: string | null;
  status: string;
  requester: { name: string } | null;
};

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [results, setResults] = useState<ResultMap>({});
  const [allRoundResults, setAllRoundResults] = useState<AllRoundResult[]>([]);
  const [previousRoundResults, setPreviousRoundResults] = useState<
    Record<string, { status: string; round: number }>
  >({});
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [retestRequests, setRetestRequests] = useState<RetestRequest[]>([]);

  const scenario: Scenario | undefined = scenarios.find((s) => s.id === id);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/results?all_rounds=true").then((r) => r.json()),
      fetch("/api/retests/mine").then((r) => r.ok ? r.json() : { requests: [] }),
    ])
      .then(([, resultsData, allRoundsData, retestData]) => {
        setResults(resultsData.results ?? {});
        setCurrentRound(resultsData.current_round ?? 1);
        setPreviousRoundResults(resultsData.previous_round_results ?? {});
        setAllRoundResults(allRoundsData.results ?? []);
        setRetestRequests(
          (retestData.requests ?? []).filter((r: RetestRequest) => r.status === "pending")
        );
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleStatusChange = useCallback(
    async (
      checkId: string,
      status: string | null,
      extra?: { notes?: string; severity?: string; defect_description?: string }
    ) => {
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
          [checkId]: {
            status,
            notes: extra?.notes ?? prev[checkId]?.notes ?? null,
            updated_at: now,
            round: currentRound,
            severity: extra?.severity ?? prev[checkId]?.severity ?? null,
            defect_description: extra?.defect_description ?? prev[checkId]?.defect_description ?? null,
          },
        }));
        fetch("/api/results", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            check_id: checkId,
            status,
            notes: extra?.notes,
            severity: extra?.severity,
            defect_description: extra?.defect_description,
          }),
        });
      }
    },
    [currentRound]
  );

  const handleRetestComplete = useCallback(
    async (requestId: string, retestResult: "pass" | "fail", retestNotes: string) => {
      await fetch(`/api/retests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retest_result: retestResult, retest_notes: retestNotes }),
      });
      setRetestRequests((prev) => prev.filter((r) => r.id !== requestId));
      const resultsRes = await fetch("/api/results");
      const resultsData = await resultsRes.json();
      setResults(resultsData.results ?? {});
    },
    []
  );

  function getCheckHistory(checkId: string) {
    const entries = allRoundResults
      .filter((r) => r.check_id === checkId)
      .map((r) => ({
        round: r.round,
        status: r.status,
        updated_at: r.updated_at,
        severity: r.severity,
        defect_description: r.defect_description,
      }));
    return entries.length > 0 ? entries : undefined;
  }

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

  const allCheckIds = scenario.steps.flatMap((step) => step.checks.map((c) => c.id));
  const totalChecks = allCheckIds.length;
  const tested = allCheckIds.filter((id) => results[id]).length;
  const failed = allCheckIds.filter(
    (id) => results[id]?.status === "fail" || results[id]?.status === "retest_fail"
  ).length;
  const percent = totalChecks > 0 ? (tested / totalChecks) * 100 : 0;

  const step = scenario.steps[activeStep];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to dashboard
            </Link>
            <NotificationBell />
          </div>

          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: scenario.color }}
            >
              {scenario.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">{scenario.persona}</p>
                <span className="inline-flex items-center rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-semibold text-brand-navy">
                  Round {currentRound}
                </span>
              </div>
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
              <p className="text-xs text-gray-400">tested</p>
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

        {/* Checkpoints */}
        <div className="space-y-3">
          {step.checks.map((check, checkIdx) => {
            const retestReq = retestRequests.find((r) => r.check_id === check.id);
            return (
              <CheckpointCardExpanded
                key={check.id}
                check={check}
                result={results[check.id]}
                currentRound={currentRound}
                history={getCheckHistory(check.id)}
                previousRoundResult={
                  previousRoundResults[check.id]
                    ? {
                        status: previousRoundResults[check.id].status,
                        round: previousRoundResults[check.id].round,
                        notes: null,
                        updated_at: "",
                      }
                    : undefined
                }
                onStatusChange={handleStatusChange}
                allResults={results}
                retestRequest={retestReq}
                onRetestComplete={handleRetestComplete}
                stepIndex={checkIdx}
                totalInStep={step.checks.length}
              />
            );
          })}
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
