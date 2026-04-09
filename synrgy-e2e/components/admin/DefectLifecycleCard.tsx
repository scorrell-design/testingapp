"use client";

import { useState } from "react";
import { scenarios } from "@/lib/scenarios";

type Defect = {
  id: string;
  tester_id: string;
  check_id: string;
  scenario_id: string;
  step_index: number;
  status: string;
  admin_notes: string | null;
  original_notes: string | null;
  retest_notes: string | null;
  retest_result: string | null;
  created_at: string;
  updated_at: string;
  tester: { id: string; name: string; email: string } | null;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  fail: { bg: "#FCEBEB", color: "#A32D2D", label: "Failed" },
  acknowledged: { bg: "#E6F1FB", color: "#185FA5", label: "Acknowledged" },
  fix_in_progress: { bg: "#FEF3C7", color: "#92400E", label: "Fix in Progress" },
  ready_for_retest: { bg: "#EDE9FE", color: "#5B21B6", label: "Ready for Retest" },
  retest_pass: { bg: "#D1FAE5", color: "#065F46", label: "Resolved" },
  retest_fail: { bg: "#FCEBEB", color: "#A32D2D", label: "Retest Failed" },
};

const LIFECYCLE_ORDER = [
  "fail",
  "acknowledged",
  "fix_in_progress",
  "ready_for_retest",
];

export default function DefectLifecycleCard({
  defect,
  onUpdate,
}: {
  defect: Defect;
  onUpdate: (id: string, status: string, adminNotes?: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(defect.admin_notes ?? "");
  const [showNotes, setShowNotes] = useState(false);

  const style = STATUS_STYLES[defect.status] ?? STATUS_STYLES.fail;
  const scenario = scenarios.find((s) => s.id === defect.scenario_id);
  const step = scenario?.steps[defect.step_index];
  let checkText = defect.check_id;
  if (step) {
    const c = step.checks.find((ch) => ch.id === defect.check_id);
    if (c) checkText = c.text;
  }

  const isResolved = defect.status === "retest_pass";
  const nextStatuses = LIFECYCLE_ORDER.filter(
    (s) => LIFECYCLE_ORDER.indexOf(s) > LIFECYCLE_ORDER.indexOf(defect.status)
  );

  function handleStatusChange(newStatus: string) {
    if (newStatus === "ready_for_retest" && !adminNotes.trim()) {
      setShowNotes(true);
      return;
    }
    onUpdate(defect.id, newStatus, adminNotes || undefined);
  }

  return (
    <div
      className={`rounded-lg border bg-white p-3 ${isResolved ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-900">{checkText}</p>
          <p className="text-[10px] text-gray-400">
            {defect.check_id} · {scenario?.title ?? defect.scenario_id} · {step?.title ?? `Step ${defect.step_index + 1}`}
          </p>
          {defect.tester && (
            <p className="text-[10px] text-gray-400">Tester: {defect.tester.name}</p>
          )}
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </div>

      {defect.original_notes && (
        <p className="mb-2 text-xs text-gray-500">
          <span className="font-medium">Tester note:</span> &ldquo;{defect.original_notes}&rdquo;
        </p>
      )}

      {defect.retest_result && (
        <p className="mb-2 text-xs">
          <span className="font-medium text-gray-600">Retest result:</span>{" "}
          <span className={defect.retest_result === "pass" ? "text-green-700" : "text-red-700"}>
            {defect.retest_result === "pass" ? "PASS ✓" : "FAIL ✗"}
          </span>
          {defect.retest_notes && (
            <span className="text-gray-500"> — &ldquo;{defect.retest_notes}&rdquo;</span>
          )}
        </p>
      )}

      {!isResolved && nextStatuses.length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          {showNotes && (
            <div className="mb-2">
              <input
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="What was fixed? (required for retest)"
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-[#005F78]"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {nextStatuses.map((s) => {
              const sStyle = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="rounded px-2 py-1 text-[10px] font-medium transition-colors hover:opacity-80"
                  style={{ backgroundColor: sStyle.bg, color: sStyle.color }}
                >
                  → {sStyle.label}
                </button>
              );
            })}
            {!showNotes && (
              <button
                onClick={() => setShowNotes(true)}
                className="rounded px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-100"
              >
                Add notes
              </button>
            )}
          </div>
        </div>
      )}

      {defect.status === "retest_fail" && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <button
            onClick={() => onUpdate(defect.id, "fix_in_progress", adminNotes || undefined)}
            className="rounded px-2 py-1 text-[10px] font-medium text-amber-700 hover:bg-amber-50"
          >
            → Back to Fix in Progress
          </button>
        </div>
      )}
    </div>
  );
}
