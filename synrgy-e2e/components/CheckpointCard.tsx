"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StatusButton from "./StatusButton";
import type { Status } from "./StatusButton";
import { STATUS_STYLES } from "./StatusButton";
import ScreenshotUpload from "./ScreenshotUpload";

export type ResultData = {
  status: string;
  notes: string | null;
  updated_at: string;
  round?: number;
  severity?: string | null;
  defect_description?: string | null;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  device?: string | null;
};

type HistoryEntry = {
  round: number;
  status: string;
  updated_at: string;
  severity?: string | null;
  defect_description?: string | null;
};

function renderNotesWithTags(text: string) {
  const parts = text.split(/(@bug|@question|@blocker)/gi);
  return parts.map((part, i) => {
    const lower = part.toLowerCase();
    if (lower === "@bug") {
      return (
        <span key={i} className="rounded bg-red-100 px-1 font-semibold text-red-700">
          @bug
        </span>
      );
    }
    if (lower === "@question") {
      return (
        <span key={i} className="rounded bg-blue-100 px-1 font-semibold text-blue-700">
          @question
        </span>
      );
    }
    if (lower === "@blocker") {
      return (
        <span key={i} className="rounded bg-amber-100 px-1 font-semibold text-amber-700">
          @blocker
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const TESTER_STATUSES: Status[] = ["pass", "fail", "blocked", "skip"];
const LEAD_STATUSES: Status[] = ["acknowledged", "fix_in_progress", "ready_for_retest"];
const RETEST_STATUSES: Status[] = ["retest_pass", "retest_fail"];

export default function CheckpointCard({
  checkId,
  text,
  expected,
  preReqs,
  result,
  currentRound,
  history,
  onStatusChange,
  previousRoundResult,
}: {
  checkId: string;
  text: string;
  expected: string;
  preReqs?: string;
  result?: ResultData;
  currentRound: number;
  history?: HistoryEntry[];
  onStatusChange: (
    checkId: string,
    status: string | null,
    extra?: {
      notes?: string;
      severity?: string;
      defect_description?: string;
    }
  ) => void;
  previousRoundResult?: ResultData;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState(result?.notes ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [severity, setSeverity] = useState(result?.severity ?? "");
  const [defectDesc, setDefectDesc] = useState(result?.defect_description ?? "");
  const [showDefectForm, setShowDefectForm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(result?.notes ?? "");
    setSeverity(result?.severity ?? "");
    setDefectDesc(result?.defect_description ?? "");
    setShowDefectForm(result?.status === "fail" || result?.status === "retest_fail");
  }, [result?.notes, result?.severity, result?.defect_description, result?.status]);

  const saveNotes = useCallback(
    (value: string) => {
      const currentStatus = result?.status ?? null;
      if (currentStatus) {
        onStatusChange(checkId, currentStatus, { notes: value || undefined });
      }
    },
    [checkId, result?.status, onStatusChange]
  );

  function handleNotesChange(value: string) {
    setNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNotes(value), 1000);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const currentStatus = result?.status ?? null;
  const isReadyForRetest = previousRoundResult?.status === "ready_for_retest";

  function handleStatusClick(status: string) {
    if (currentStatus === status) {
      onStatusChange(checkId, null);
      setShowDefectForm(false);
    } else if (status === "fail" || status === "retest_fail") {
      setShowDefectForm(true);
      if (severity && defectDesc) {
        onStatusChange(checkId, status, {
          notes: notes || undefined,
          severity,
          defect_description: defectDesc,
        });
      }
    } else {
      setShowDefectForm(false);
      onStatusChange(checkId, status, { notes: notes || undefined });
    }
  }

  function handleDefectSubmit() {
    if (!severity || !defectDesc.trim()) return;
    const status = currentRound > 1 && isReadyForRetest ? "retest_fail" : "fail";
    onStatusChange(checkId, status, {
      notes: notes || undefined,
      severity,
      defect_description: defectDesc.trim(),
    });
  }

  const timeStr = result?.updated_at
    ? new Date(result.updated_at).toLocaleString()
    : null;

  const statusStyle = currentStatus && currentStatus in STATUS_STYLES
    ? STATUS_STYLES[currentStatus as Status]
    : null;

  const showLeadActions = currentStatus === "fail" || currentStatus === "retest_fail"
    || currentStatus === "acknowledged" || currentStatus === "fix_in_progress";

  const showRetestButtons = isReadyForRetest && !currentStatus;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Ready for re-test banner */}
      {isReadyForRetest && !currentStatus && (
        <div className="mb-3 -mx-4 -mt-4 rounded-t-xl bg-amber-50 border-b border-amber-200 px-4 py-2">
          <p className="text-xs font-medium text-amber-800">
            Previously failed in Round {(previousRoundResult?.round ?? currentRound - 1)}. Fix deployed — please re-test.
          </p>
        </div>
      )}

      {/* Header row: check ID + round badge */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{checkId}</span>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={
            currentStatus && statusStyle
              ? { backgroundColor: statusStyle.activeBg + "18", color: statusStyle.activeBg }
              : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
          }
        >
          R{result?.round ?? currentRound}
        </span>
      </div>

      {/* Test description */}
      <p className="mb-3 text-sm font-medium text-gray-800">{text}</p>

      {/* Expected result container */}
      <div className="mb-3 rounded-lg border-l-4 border-emerald-400 bg-emerald-50/60 px-3 py-2.5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          Expected Result
        </p>
        <p className="text-xs leading-relaxed text-gray-700">{expected}</p>
      </div>

      {/* Pre-reqs */}
      {preReqs && (
        <p className="mb-3 text-[11px] text-gray-500">
          <span className="font-semibold text-gray-600">Pre-reqs:</span> {preReqs}
        </p>
      )}

      {/* Acknowledged info */}
      {result?.acknowledged_by && (
        <div className="mb-2 rounded bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
          Acknowledged by {result.acknowledged_by}
          {result.acknowledged_at && (
            <> on {new Date(result.acknowledged_at).toLocaleDateString()}</>
          )}
        </div>
      )}

      {/* Status buttons — tester row */}
      <div className="flex flex-wrap items-center gap-2">
        {showRetestButtons ? (
          <>
            {RETEST_STATUSES.map((status) => (
              <StatusButton
                key={status}
                status={status}
                isActive={currentStatus === status}
                onClick={() => handleStatusClick(status)}
              />
            ))}
          </>
        ) : (
          <>
            {TESTER_STATUSES.map((status) => (
              <StatusButton
                key={status}
                status={status}
                isActive={currentStatus === status}
                onClick={() => handleStatusClick(status)}
              />
            ))}
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showNotes ? "Hide notes" : "Add note"}
          </button>

          {timeStr && (
            <span className="text-xs text-gray-300">{timeStr}</span>
          )}
        </div>
      </div>

      {/* Lead/PM actions for failed items */}
      {showLeadActions && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Lifecycle:
          </span>
          {LEAD_STATUSES.map((status) => (
            <StatusButton
              key={status}
              status={status}
              isActive={currentStatus === status}
              onClick={() => handleStatusClick(status)}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Defect form — appears when Fail is clicked */}
      {showDefectForm && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-red-800">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded border border-red-200 bg-white px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            >
              <option value="">Select severity…</option>
              <option value="critical">Critical — completely broken, blocks other testing</option>
              <option value="major">Major — feature doesn't work but workaround exists</option>
              <option value="minor">Minor — cosmetic, styling, non-functional issue</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-red-800">
              What happened? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={defectDesc}
              onChange={(e) => setDefectDesc(e.target.value)}
              placeholder="Describe the actual behavior you observed…"
              rows={3}
              className="w-full resize-none rounded border border-red-200 bg-white px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDefectSubmit}
              disabled={!severity || !defectDesc.trim()}
              className="rounded bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-40"
            >
              Submit defect
            </button>
            <button
              onClick={() => setShowDefectForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes section */}
      {showNotes && (
        <div className="mt-3">
          {isFocused ? (
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Add notes… Use @bug, @question, or @blocker for quick tags"
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsFocused(true)}
              className="min-h-[52px] cursor-text rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 transition-colors hover:border-gray-300"
            >
              {notes ? (
                <span className="whitespace-pre-wrap">{renderNotesWithTags(notes)}</span>
              ) : (
                <span className="text-gray-400">
                  Add notes… Use @bug, @question, or @blocker for quick tags
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Screenshot upload */}
      <ScreenshotUpload checkId={checkId} />

      {/* History toggle */}
      {history && history.length > 1 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            {showHistory ? "Hide history" : `View history (${history.length} rounds)`}
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1">
              {history.map((h) => {
                const hs = h.status in STATUS_STYLES
                  ? STATUS_STYLES[h.status as Status]
                  : null;
                return (
                  <div key={h.round} className="flex items-center gap-2 text-[11px]">
                    <span className="font-medium text-gray-500">R{h.round}:</span>
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={
                        hs
                          ? { backgroundColor: hs.activeBg + "18", color: hs.activeBg }
                          : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                      }
                    >
                      {hs ? STATUS_STYLES[h.status as Status].label : h.status}
                    </span>
                    <span className="text-gray-400">
                      {new Date(h.updated_at).toLocaleDateString()}
                    </span>
                    {h.severity && (
                      <span className="rounded bg-red-100 px-1 text-[10px] font-medium text-red-700">
                        {h.severity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
