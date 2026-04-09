"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import ScenarioCard from "@/components/ScenarioCard";
import StatCard from "@/components/StatCard";
import NotificationBell from "@/components/notifications/NotificationBell";

type Tester = { id: string; name: string; email: string; role?: string };
type ResultMap = Record<string, { status: string; notes: string | null; updated_at: string }>;
type Assignment = {
  scenario_id: string;
  persona: string;
  notes: string | null;
  assigner: { name: string } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tester, setTester] = useState<Tester | null>(null);
  const [results, setResults] = useState<ResultMap>({});
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [startingNewRound, setStartingNewRound] = useState(false);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [retestCount, setRetestCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/round").then((r) => r.json()),
      fetch("/api/assignments/mine").then((r) => r.ok ? r.json() : { assignments: [] }),
      fetch("/api/retests/mine").then((r) => r.ok ? r.json() : { requests: [] }),
    ])
      .then(([authData, resultsData, roundData, assignData, retestData]) => {
        setTester(authData.tester);
        setResults(resultsData.results ?? {});
        setCurrentRound(roundData.current_round ?? 1);
        setMyAssignments(assignData.assignments ?? []);
        const pending = (retestData.requests ?? []).filter(
          (r: { status: string }) => r.status === "pending"
        );
        setRetestCount(pending.length);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  const handleReset = useCallback(async () => {
    await fetch("/api/results/all", { method: "DELETE" });
    setResults({});
    setShowReset(false);
  }, []);

  const handleStartNewRound = useCallback(async () => {
    setStartingNewRound(true);
    try {
      const res = await fetch("/api/round", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCurrentRound(data.current_round);
        const resultsRes = await fetch("/api/results");
        const resultsData = await resultsRes.json();
        setResults(resultsData.results ?? {});
      }
    } catch {
      // silent
    } finally {
      setStartingNewRound(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  const isAdmin = tester?.role === "admin";

  const assignedScenarios = scenarios.filter((s) =>
    myAssignments.some((a) => a.scenario_id === s.id)
  );

  const displayScenarios = isAdmin ? scenarios : assignedScenarios;

  const relevantCheckIds = displayScenarios.flatMap((s) =>
    s.steps.flatMap((step) => step.checks.map((c) => c.id))
  );
  const totalChecks = relevantCheckIds.length;
  const tested = relevantCheckIds.filter((id) => results[id]).length;
  const passed = relevantCheckIds.filter(
    (id) => results[id]?.status === "pass" || results[id]?.status === "retest_pass"
  ).length;
  const failed = relevantCheckIds.filter(
    (id) => results[id]?.status === "fail" || results[id]?.status === "retest_fail"
  ).length;
  const blocked = relevantCheckIds.filter((id) => results[id]?.status === "blocked").length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-xs font-semibold text-white">
              S
            </div>
            <h1 className="text-base font-semibold text-gray-900">
              E2E Testing
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {retestCount > 0 && (
              <Link
                href="/retests"
                className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
              >
                Retests
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {retestCount}
                </span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full border border-brand-navy/20 bg-brand-navy/5 px-3 py-1 text-xs font-medium text-brand-navy hover:bg-brand-navy/10"
              >
                Admin
              </Link>
            )}
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-semibold text-brand-navy">
                {tester?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <span className="hidden text-sm text-gray-500 sm:inline">{tester?.name}</span>
              <span className="inline-flex items-center rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-semibold text-brand-navy">
                R{currentRound}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Stats — only shown when tester has assignments or is admin */}
        {displayScenarios.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Tested" value={`${tested}/${totalChecks}`} />
            <StatCard label="Passed" value={passed} color="#0F6E56" />
            <StatCard label="Failed" value={failed} color="#A32D2D" />
            <StatCard label="Blocked" value={blocked} color="#854F0B" />
          </div>
        )}

        {/* Actions row */}
        {displayScenarios.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {isAdmin ? "All Scenarios" : "Your Assigned Scenarios"}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartNewRound}
                disabled={startingNewRound}
                className="rounded-full border border-brand-navy/30 bg-brand-navy/5 px-3 py-1 text-xs font-medium text-brand-navy transition-colors hover:bg-brand-navy/10 disabled:opacity-50"
              >
                {startingNewRound ? "Starting…" : `Start Round ${currentRound + 1}`}
              </button>
              <button
                onClick={() => setShowReset(true)}
                className="text-xs text-gray-400 hover:text-status-fail"
              >
                Reset all progress
              </button>
            </div>
          </div>
        )}

        {/* Reset confirmation */}
        {showReset && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-status-fail-border bg-status-fail-light p-3">
            <p className="flex-1 text-sm text-status-fail">
              This will delete all your test results. Are you sure?
            </p>
            <button
              onClick={handleReset}
              className="rounded bg-status-fail px-3 py-1 text-xs font-medium text-white"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Empty state for testers with no assignments */}
        {!isAdmin && displayScenarios.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">No test scenarios assigned yet</h3>
            <p className="max-w-sm text-sm text-gray-500">
              Your admin will assign you testing paths — you&apos;ll get an email when it&apos;s time to start.
            </p>
          </div>
        )}

        {/* Scenario cards */}
        {displayScenarios.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayScenarios.map((scenario, i) => {
              const assignment = myAssignments.find((a) => a.scenario_id === scenario.id);
              return (
                <div key={scenario.id}>
                  {assignment && (
                    <div className="mb-1 flex items-center gap-1 px-1">
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        {assignment.persona}
                      </span>
                      {assignment.assigner?.name && (
                        <span className="text-[10px] text-gray-400">
                          Assigned by {assignment.assigner.name}
                        </span>
                      )}
                    </div>
                  )}
                  <ScenarioCard
                    scenario={scenario}
                    index={i}
                    results={results}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
