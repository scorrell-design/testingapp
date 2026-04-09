"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import type { AdminTab } from "@/components/admin/AdminNav";
import TesterCard from "@/components/admin/TesterCard";
import BugCard from "@/components/admin/BugCard";
import NotificationsTab from "@/components/admin/NotificationsTab";
import DefectLifecycleCard from "@/components/admin/DefectLifecycleCard";
import StatCard from "@/components/StatCard";
import { scenarios } from "@/lib/scenarios";

type Stats = {
  totalTested: number;
  totalPossible: number;
  passRate: number;
  failCount: number;
  activeTesters: number;
};

type TesterData = {
  id: string;
  name: string;
  email: string;
  totalTested: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  lastActive: string | null;
  assignments: Array<{ scenario_id: string; persona: string }>;
};

type Bug = {
  id: string;
  check_id: string | null;
  scenario_id: string | null;
  step_title: string | null;
  platform: string | null;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
};

type SystemGroup = {
  platform: string;
  checkpoints: Array<{
    checkId: string;
    text: string;
    scenarioId: string;
    scenarioTitle: string;
    stepTitle: string;
    results: Array<{ testerId: string; testerName: string; status: string; notes: string | null }>;
    aggregateStatus: string;
  }>;
};

type FailureCluster = {
  id: string;
  title: string;
  platform: string;
  checkIds: string[];
  failures: Array<{
    checkId: string;
    testerName: string;
    checkText: string;
    notes: string | null;
  }>;
  testerCount: number;
  keywords: string[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("progress");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [testers, setTesters] = useState<TesterData[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [systems, setSystems] = useState<SystemGroup[]>([]);
  const [clusters, setClusters] = useState<FailureCluster[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [defects, setDefects] = useState<any[]>([]);
  const [bugFilter, setBugFilter] = useState({ status: "", severity: "", platform: "" });
  const [showBugForm, setShowBugForm] = useState(false);
  const [newBug, setNewBug] = useState({ title: "", description: "", platform: "", severity: "P1", assignee: "" });

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) { router.push("/login"); return; }
      const authData = await authRes.json();
      if (authData.tester?.role !== "admin") { router.push("/dashboard"); return; }

      const [statsRes, testersRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/testers"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (testersRes.ok) {
        const td = await testersRes.json();
        setTesters(td.testers ?? []);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeTab === "bugs") {
      const params = new URLSearchParams();
      if (bugFilter.status) params.set("status", bugFilter.status);
      if (bugFilter.severity) params.set("severity", bugFilter.severity);
      if (bugFilter.platform) params.set("platform", bugFilter.platform);
      fetch(`/api/admin/bugs?${params}`)
        .then((r) => r.json())
        .then((d) => setBugs(d.bugs ?? []))
        .catch(() => {});
      fetch("/api/admin/defects")
        .then((r) => r.json())
        .then((d) => setDefects(d.defects ?? []))
        .catch(() => {});
    }
  }, [activeTab, bugFilter]);

  useEffect(() => {
    if (activeTab === "systems") {
      fetch("/api/admin/dashboard/by-system")
        .then((r) => r.json())
        .then((d) => setSystems(d.systems ?? []))
        .catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "consolidation") {
      fetch("/api/admin/consolidation")
        .then((r) => r.json())
        .then((d) => setClusters(d.autoClusters ?? []))
        .catch(() => {});
    }
  }, [activeTab]);

  async function handleBugUpdate(id: string, updates: Partial<Bug>) {
    await fetch(`/api/admin/bugs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }

  async function handleCreateBug() {
    if (!newBug.title) return;
    const res = await fetch("/api/admin/bugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBug),
    });
    if (res.ok) {
      const data = await res.json();
      setBugs((prev) => [data.bug, ...prev]);
      setNewBug({ title: "", description: "", platform: "", severity: "P1", assignee: "" });
      setShowBugForm(false);
    }
  }

  async function handleCreateBugFromCluster(cluster: FailureCluster) {
    const description = cluster.failures
      .map((f) => `• [${f.checkId}] ${f.checkText}\n  Tester: ${f.testerName}${f.notes ? `\n  Notes: ${f.notes}` : ""}`)
      .join("\n\n");

    const res = await fetch("/api/admin/bugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: cluster.title,
        description,
        platform: cluster.platform,
        severity: cluster.failures.length >= 3 ? "P0" : "P1",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      await fetch(`/api/admin/consolidation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cluster.title,
          platform: cluster.platform,
          check_ids: cluster.checkIds,
          bug_id: data.bug.id,
        }),
      });
      alert("Bug created from cluster!");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  const platforms = [...new Set(scenarios.flatMap((s) => s.steps.map((st) => st.platform)))];

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-xs font-semibold text-white">
              S
            </div>
            <h1 className="text-base font-semibold text-gray-900">E2E Testing</h1>
            <span className="rounded bg-brand-navy/10 px-2 py-0.5 text-[10px] font-semibold text-brand-navy">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/assignments" className="text-sm text-gray-500 hover:text-gray-700">Assignments</Link>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Tester view</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <AdminNav active={activeTab} onChange={setActiveTab} />
        </div>

        {/* View A: Progress */}
        {activeTab === "progress" && (
          <div>
            {stats && (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Checkpoints tested" value={`${stats.totalTested}/${stats.totalPossible}`} />
                <StatCard label="Pass rate" value={`${stats.passRate}%`} color="#0F6E56" />
                <StatCard label="Active failures" value={stats.failCount} color="#A32D2D" />
                <StatCard label="Active testers (7d)" value={stats.activeTesters} />
              </div>
            )}

            <h3 className="mb-3 text-sm font-semibold text-gray-700">Testers</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {testers.map((t) => (
                <TesterCard
                  key={t.id}
                  tester={t}
                  onClick={() => router.push(`/admin/tester/${t.id}`)}
                />
              ))}
              {testers.length === 0 && (
                <p className="col-span-full text-sm text-gray-400">No testers yet</p>
              )}
            </div>
          </div>
        )}

        {/* View B: By System */}
        {activeTab === "systems" && (
          <div className="space-y-4">
            {systems.map((sys) => (
              <details key={sys.platform} className="rounded-xl border border-gray-200 bg-white">
                <summary className="cursor-pointer px-4 py-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{sys.platform}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {sys.checkpoints.length} checkpoints
                    </span>
                    <span className="rounded-full bg-status-fail-light px-2 py-0.5 text-xs text-status-fail">
                      {sys.checkpoints.filter((c) => c.aggregateStatus === "any_fail").length} failing
                    </span>
                  </div>
                </summary>
                <div className="border-t border-gray-100 px-4 py-2">
                  <div className="space-y-2">
                    {sys.checkpoints.map((cp) => {
                      const statusColor =
                        cp.aggregateStatus === "any_fail" ? "#A32D2D" :
                        cp.aggregateStatus === "all_pass" ? "#0F6E56" :
                        cp.aggregateStatus === "mixed" ? "#854F0B" : "#9ca3af";
                      return (
                        <div key={cp.checkId} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
                          <div
                            className="mt-1 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: statusColor }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-800">{cp.text}</p>
                            <p className="text-[10px] text-gray-400">
                              {cp.checkId} · {cp.scenarioTitle} · {cp.stepTitle}
                            </p>
                            {cp.results.length > 0 && (
                              <div className="mt-0.5 flex flex-wrap gap-1">
                                {cp.results.map((r, i) => (
                                  <span
                                    key={i}
                                    className="rounded px-1 py-0.5 text-[10px]"
                                    style={{
                                      backgroundColor:
                                        r.status === "pass" || r.status === "retest_pass"
                                          ? "#E1F5EE" : r.status === "fail" || r.status === "retest_fail"
                                          ? "#FCEBEB" : "#FAEEDA",
                                      color:
                                        r.status === "pass" || r.status === "retest_pass"
                                          ? "#0F6E56" : r.status === "fail" || r.status === "retest_fail"
                                          ? "#A32D2D" : "#854F0B",
                                    }}
                                  >
                                    {r.testerName}: {r.status}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            ))}
            {systems.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        )}

        {/* View C: Bug Tracker */}
        {activeTab === "bugs" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <select
                value={bugFilter.status}
                onChange={(e) => setBugFilter((p) => ({ ...p, status: e.target.value }))}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="fixed">Fixed</option>
                <option value="wont_fix">Won&apos;t fix</option>
                <option value="deferred">Deferred</option>
              </select>
              <select
                value={bugFilter.severity}
                onChange={(e) => setBugFilter((p) => ({ ...p, severity: e.target.value }))}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="">All severities</option>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
              <select
                value={bugFilter.platform}
                onChange={(e) => setBugFilter((p) => ({ ...p, platform: e.target.value }))}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="">All platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={() => setShowBugForm(!showBugForm)}
                className="ml-auto rounded-lg bg-brand-navy px-3 py-1 text-xs font-medium text-white"
              >
                + Add bug
              </button>
            </div>

            {showBugForm && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 space-y-2">
                <input
                  value={newBug.title}
                  onChange={(e) => setNewBug((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Bug title"
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                />
                <textarea
                  value={newBug.description}
                  onChange={(e) => setNewBug((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description"
                  rows={2}
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <select
                    value={newBug.platform}
                    onChange={(e) => setNewBug((p) => ({ ...p, platform: e.target.value }))}
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                  >
                    <option value="">Platform</option>
                    {platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <select
                    value={newBug.severity}
                    onChange={(e) => setNewBug((p) => ({ ...p, severity: e.target.value }))}
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                  <input
                    value={newBug.assignee}
                    onChange={(e) => setNewBug((p) => ({ ...p, assignee: e.target.value }))}
                    placeholder="Assignee"
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                  />
                  <button onClick={handleCreateBug} className="rounded bg-brand-navy px-3 py-1 text-xs font-medium text-white">
                    Create
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {bugs.map((b) => (
                <BugCard key={b.id} bug={b} onUpdate={handleBugUpdate} />
              ))}
              {bugs.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">No bugs found</p>
              )}
            </div>

            {/* Defect Lifecycle */}
            {defects.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Defect Lifecycle</h3>
                <div className="space-y-2">
                  {defects
                    .filter((d) => d.status !== "retest_pass")
                    .map((d) => (
                      <DefectLifecycleCard
                        key={d.id}
                        defect={d}
                        onUpdate={async (id, status, adminNotes) => {
                          const res = await fetch(`/api/admin/defects/${id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status, admin_notes: adminNotes }),
                          });
                          if (res.ok) {
                            setDefects((prev) =>
                              prev.map((dd) => (dd.id === id ? { ...dd, status, admin_notes: adminNotes ?? dd.admin_notes } : dd))
                            );
                          }
                        }}
                      />
                    ))}
                </div>
                {defects.some((d) => d.status === "retest_pass") && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                      Resolved ({defects.filter((d) => d.status === "retest_pass").length})
                    </summary>
                    <div className="mt-2 space-y-2">
                      {defects
                        .filter((d) => d.status === "retest_pass")
                        .map((d) => (
                          <DefectLifecycleCard
                            key={d.id}
                            defect={d}
                            onUpdate={() => {}}
                          />
                        ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {/* View D: Consolidation */}
        {activeTab === "consolidation" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Auto-grouped failure clusters. Review and create consolidated bugs.
            </p>
            {clusters.map((cluster) => (
              <details key={cluster.id} className="rounded-xl border border-gray-200 bg-white">
                <summary className="cursor-pointer px-4 py-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{cluster.title}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                      {cluster.platform}
                    </span>
                    <span className="rounded-full bg-status-fail-light px-2 py-0.5 text-[10px] text-status-fail">
                      {cluster.testerCount} tester{cluster.testerCount > 1 ? "s" : ""} affected
                    </span>
                  </div>
                </summary>
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {cluster.keywords.map((kw) => (
                      <span key={kw} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                        {kw}
                      </span>
                    ))}
                  </div>
                  {cluster.failures.map((f, i) => (
                    <div key={i} className="border-b border-gray-50 pb-1 last:border-0">
                      <p className="text-xs text-gray-800">
                        <span className="font-medium text-gray-500">{f.checkId}</span> {f.checkText}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {f.testerName}{f.notes ? ` — ${f.notes}` : ""}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => handleCreateBugFromCluster(cluster)}
                    className="mt-2 rounded bg-brand-navy px-3 py-1 text-xs font-medium text-white"
                  >
                    Create consolidated bug
                  </button>
                </div>
              </details>
            ))}
            {clusters.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">No failure clusters found</p>
            )}
          </div>
        )}

        {/* View E: Notifications */}
        {activeTab === "notifications" && <NotificationsTab />}
      </main>
    </div>
  );
}
