"use client";

import { useEffect, useState } from "react";

type InactiveTester = {
  id: string;
  name: string;
  email: string;
  assignmentCount: number;
};

export default function NudgeCard({ onSent }: { onSent: () => void }) {
  const [inactive, setInactive] = useState<InactiveTester[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudging, setNudging] = useState<string | null>(null);
  const [nudgingAll, setNudgingAll] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dashboard/testers")
      .then((r) => r.json())
      .then((data) => {
        const testers = data.testers ?? [];
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const inactiveTesters = testers
          .filter((t: { lastActive: string | null; assignments: unknown[] }) =>
            t.assignments.length > 0 && (!t.lastActive || t.lastActive < sevenDaysAgo)
          )
          .map((t: { id: string; name: string; email: string; assignments: unknown[] }) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            assignmentCount: t.assignments.length,
          }));
        setInactive(inactiveTesters);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function nudge(ids: string[]) {
    const res = await fetch("/api/admin/email/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tester_ids: ids }),
    });
    if (res.ok) onSent();
    return res.ok;
  }

  async function handleNudgeOne(id: string) {
    setNudging(id);
    await nudge([id]);
    setInactive((prev) => prev.filter((t) => t.id !== id));
    setNudging(null);
  }

  async function handleNudgeAll() {
    setNudgingAll(true);
    await nudge(inactive.map((t) => t.id));
    setInactive([]);
    setNudgingAll(false);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-900">Nudge inactive testers</h4>
      <p className="mb-3 text-xs text-gray-500">
        Testers assigned but no results in 7+ days.
      </p>

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : inactive.length === 0 ? (
        <p className="text-xs text-gray-400">No inactive testers</p>
      ) : (
        <>
          <div className="mb-2 space-y-2">
            {inactive.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-900">{t.name}</p>
                  <p className="text-[10px] text-gray-400">{t.assignmentCount} scenario{t.assignmentCount > 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => handleNudgeOne(t.id)}
                  disabled={nudging === t.id}
                  className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {nudging === t.id ? "..." : "Send reminder"}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleNudgeAll}
            disabled={nudgingAll}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {nudgingAll ? "Sending..." : `Remind all (${inactive.length})`}
          </button>
        </>
      )}
    </div>
  );
}
