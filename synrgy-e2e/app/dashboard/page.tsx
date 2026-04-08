"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { scenarios, getCheckIdsForPaths } from "@/lib/scenarios";
import type { Path } from "@/lib/scenarios";
import ScenarioCard from "@/components/ScenarioCard";
import StatCard from "@/components/StatCard";
import PathAssignment from "@/components/PathAssignment";
import DeviceManager from "@/components/DeviceManager";

type Tester = { id: string; name: string; email: string };
type ResultMap = Record<string, { status: string; notes: string | null; updated_at: string }>;

export default function DashboardPage() {
  const router = useRouter();
  const [tester, setTester] = useState<Tester | null>(null);
  const [results, setResults] = useState<ResultMap>({});
  const [assignedPaths, setAssignedPaths] = useState<Path[]>(["core"]);
  const [showAllPaths, setShowAllPaths] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [startingNewRound, setStartingNewRound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error("Not auth");
        return r.json();
      }),
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/paths").then((r) => r.json()),
      fetch("/api/round").then((r) => r.json()),
    ])
      .then(([authData, resultsData, pathsData, roundData]) => {
        setTester(authData.tester);
        setResults(resultsData.results ?? {});
        const paths = pathsData.paths ?? [];
        setAssignedPaths(["core", ...paths] as Path[]);
        setCurrentRound(roundData.current_round ?? 1);
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

  const activePaths: Path[] = showAllPaths
    ? ["core", "path-a", "path-b", "path-c"]
    : assignedPaths;

  const relevantCheckIds = scenarios.flatMap((s) =>
    getCheckIdsForPaths(s, activePaths)
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
              E2E Testing Walkthrough
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{tester?.name}</span>
              <span className="inline-flex items-center rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-semibold text-brand-navy">
                Round {currentRound}
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
        {/* Device manager + Path assignment row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <PathAssignment />
          <DeviceManager />
        </div>

        {/* Global stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Tested" value={`${tested}/${totalChecks}`} />
          <StatCard label="Passed" value={passed} color="#0F6E56" />
          <StatCard label="Failed" value={failed} color="#A32D2D" />
          <StatCard label="Blocked" value={blocked} color="#854F0B" />
        </div>

        {/* Actions row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-700">Scenarios</h2>
            <button
              onClick={() => setShowAllPaths(!showAllPaths)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={
                showAllPaths
                  ? {
                      borderColor: "#1A3A5C",
                      backgroundColor: "#1A3A5C10",
                      color: "#1A3A5C",
                    }
                  : {
                      borderColor: "#e5e7eb",
                      color: "#6b7280",
                    }
              }
            >
              {showAllPaths ? "Showing all paths" : "Showing my paths"}
            </button>
          </div>
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

        {/* Scenario cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, i) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              index={i}
              results={results}
              assignedPaths={activePaths}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
