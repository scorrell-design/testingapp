"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import NotificationBell from "@/components/notifications/NotificationBell";

type RetestRequest = {
  id: string;
  check_id: string;
  scenario_id: string;
  reason: string;
  what_to_verify: string;
  original_status: string | null;
  original_notes: string | null;
  priority: string;
  status: string;
  retest_result: string | null;
  retest_notes: string | null;
  created_at: string;
  completed_at: string | null;
  requester: { name: string } | null;
};

export default function RetestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RetestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [retestNotes, setRetestNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) { router.push("/login"); return; }

      const res = await fetch("/api/retests/mine");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests ?? []);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function handleComplete(id: string, result: "pass" | "fail") {
    const notes = retestNotes[id] || "";
    const res = await fetch(`/api/retests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retest_result: result, retest_notes: notes }),
    });
    if (res.ok) load();
  }

  function getCheckText(checkId: string): string {
    for (const s of scenarios) {
      for (const step of s.steps) {
        const c = step.checks.find((ch) => ch.id === checkId);
        if (c) return c.text;
      }
    }
    return checkId;
  }

  const pending = requests.filter((r) => r.status === "pending");
  const completed = requests.filter((r) => r.status === "completed");
  const shown = activeTab === "pending" ? pending : completed;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <h1 className="text-base font-semibold text-gray-900">Retests</h1>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeTab === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeTab === "completed"
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            Completed ({completed.length})
          </button>
        </div>

        <div className="space-y-3">
          {shown.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              {activeTab === "pending" ? "No pending retests" : "No completed retests"}
            </p>
          )}

          {shown.map((req) => {
            const checkText = getCheckText(req.check_id);
            const scenario = scenarios.find((s) => s.id === req.scenario_id);

            return (
              <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-4">
                {req.priority === "urgent" && (
                  <div className="mb-2 -mx-4 -mt-4 rounded-t-xl bg-red-50 border-b border-red-200 px-4 py-1.5">
                    <span className="text-xs font-semibold text-red-700">⚡ Urgent</span>
                  </div>
                )}

                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">{req.check_id}</span>
                  {scenario && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: scenario.bg, color: scenario.color }}
                    >
                      {scenario.icon} {scenario.title}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="mb-3 text-sm font-medium text-gray-800">{checkText}</p>

                <div className="space-y-2">
                  <div className="rounded-lg bg-blue-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                      What changed
                    </p>
                    <p className="text-xs text-gray-700">{req.reason}</p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      What to verify
                    </p>
                    <p className="text-xs text-gray-700">{req.what_to_verify}</p>
                  </div>

                  {req.original_notes && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Your original report
                      </p>
                      <p className="text-xs text-gray-600">{req.original_notes}</p>
                    </div>
                  )}
                </div>

                {req.requester?.name && (
                  <p className="mt-2 text-[10px] text-gray-400">
                    Requested by {req.requester.name}
                  </p>
                )}

                {req.status === "pending" && (
                  <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                    <textarea
                      value={retestNotes[req.id] ?? ""}
                      onChange={(e) =>
                        setRetestNotes((p) => ({ ...p, [req.id]: e.target.value }))
                      }
                      placeholder="Add notes about your retest..."
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(req.id, "pass")}
                        className="rounded-lg bg-status-pass px-4 py-2 text-sm font-medium text-white"
                      >
                        ✅ Fixed
                      </button>
                      <button
                        onClick={() => handleComplete(req.id, "fail")}
                        className="rounded-lg bg-status-fail px-4 py-2 text-sm font-medium text-white"
                      >
                        ❌ Still broken
                      </button>
                      <Link
                        href={`/scenario/${req.scenario_id}`}
                        className="ml-auto rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Go to test →
                      </Link>
                    </div>
                  </div>
                )}

                {req.status === "completed" && req.retest_result && (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: req.retest_result === "pass" ? "#E1F5EE" : "#FCEBEB",
                        color: req.retest_result === "pass" ? "#0F6E56" : "#A32D2D",
                      }}
                    >
                      {req.retest_result === "pass" ? "✅ Verified fixed" : "❌ Still broken"}
                    </span>
                    {req.retest_notes && (
                      <p className="mt-1 text-xs text-gray-600">{req.retest_notes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
