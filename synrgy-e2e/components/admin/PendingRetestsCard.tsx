"use client";

import { useEffect, useState } from "react";

type PendingTester = {
  id: string;
  name: string;
  pendingCount: number;
};

export default function PendingRetestsCard({ onSent }: { onSent: () => void }) {
  const [testers, setTesters] = useState<PendingTester[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudging, setNudging] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard/testers")
      .then((r) => r.json())
      .then(async (data) => {
        const allTesters = data.testers ?? [];
        const pendingTesters: PendingTester[] = [];

        for (const t of allTesters) {
          const res = await fetch(`/api/admin/dashboard/tester/${t.id}`);
          if (!res.ok) continue;
          const detail = await res.json();
          const pendingRetests = (detail.retestRequests ?? []).filter(
            (r: { status: string }) => r.status === "pending"
          );
          if (pendingRetests.length > 0) {
            pendingTesters.push({ id: t.id, name: t.name, pendingCount: pendingRetests.length });
          }
        }

        setTesters(pendingTesters);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleNudge(testerId: string) {
    setNudging(testerId);
    const res = await fetch("/api/admin/email/nudge-retests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tester_ids: [testerId] }),
    });
    if (res.ok) {
      onSent();
      setTesters((prev) => prev.filter((t) => t.id !== testerId));
    }
    setNudging(null);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-900">Pending retests</h4>
      <p className="mb-3 text-xs text-gray-500">
        Testers with unfinished retest requests.
      </p>

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : testers.length === 0 ? (
        <p className="text-xs text-gray-400">No pending retests</p>
      ) : (
        <div className="space-y-2">
          {testers.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-900">{t.name}</p>
                <p className="text-[10px] text-gray-400">
                  {t.pendingCount} retest{t.pendingCount > 1 ? "s" : ""} pending
                </p>
              </div>
              <button
                onClick={() => handleNudge(t.id)}
                disabled={nudging === t.id}
                className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {nudging === t.id ? "..." : "Send reminder"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
