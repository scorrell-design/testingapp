"use client";

import { scenarios } from "@/lib/scenarios";

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

export default function TesterCard({
  tester,
  onClick,
}: {
  tester: TesterData;
  onClick: () => void;
}) {
  const remaining = Math.max(
    0,
    tester.totalTested - tester.passed - tester.failed - tester.blocked - tester.skipped
  );
  const total = tester.totalTested || 1;
  const percent = total > 0 ? Math.round((tester.totalTested / Math.max(total, 1)) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:border-brand-navy/30 hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-semibold text-brand-navy">
          {tester.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{tester.name}</p>
          <p className="truncate text-xs text-gray-400">{tester.email}</p>
        </div>
      </div>

      {tester.assignments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tester.assignments.map((a) => {
            const s = scenarios.find((sc) => sc.id === a.scenario_id);
            return (
              <span
                key={a.scenario_id}
                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: s?.bg ?? "#f3f4f6",
                  color: s?.color ?? "#6b7280",
                }}
              >
                {s?.icon ?? ""} {s?.title ?? a.scenario_id}
              </span>
            );
          })}
        </div>
      )}

      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-brand-navy transition-all"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
        <span className="text-status-pass font-medium">{tester.passed} passed</span>
        <span className="text-status-fail font-medium">{tester.failed} failed</span>
        <span className="text-status-blocked font-medium">{tester.blocked} blocked</span>
        <span className="text-gray-400">{tester.skipped} skipped</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        {tester.lastActive && (
          <p className="text-[10px] text-gray-400">
            Last active: {new Date(tester.lastActive).toLocaleDateString()}
          </p>
        )}
        <span className="text-[11px] font-medium text-brand-navy">
          View full results &rarr;
        </span>
      </div>
    </button>
  );
}
