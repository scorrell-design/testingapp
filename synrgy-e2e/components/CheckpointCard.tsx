"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StatusButton from "./StatusButton";
import ScreenshotUpload from "./ScreenshotUpload";

type ResultData = {
  status: string;
  notes: string | null;
  updated_at: string;
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

export default function CheckpointCard({
  checkId,
  text,
  result,
  onStatusChange,
}: {
  checkId: string;
  text: string;
  result?: ResultData;
  onStatusChange: (
    checkId: string,
    status: string | null,
    notes?: string
  ) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(result?.notes ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(result?.notes ?? "");
  }, [result?.notes]);

  const saveNotes = useCallback(
    (value: string) => {
      const currentStatus = result?.status ?? null;
      if (currentStatus) {
        onStatusChange(checkId, currentStatus, value || undefined);
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

  function handleStatusClick(status: string) {
    if (currentStatus === status) {
      onStatusChange(checkId, null);
    } else {
      onStatusChange(checkId, status, notes || undefined);
    }
  }

  const timeStr = result?.updated_at
    ? new Date(result.updated_at).toLocaleString()
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="mr-2 inline-block text-xs font-medium text-gray-400">
            {checkId}
          </span>
          <span className="text-sm text-gray-800">{text}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["pass", "fail", "blocked", "skip"] as const).map((status) => (
          <StatusButton
            key={status}
            status={status}
            isActive={currentStatus === status}
            onClick={() => handleStatusClick(status)}
          />
        ))}

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600"
        >
          {showNotes ? "Hide notes" : "Add note"}
        </button>

        {timeStr && (
          <span className="text-xs text-gray-300">{timeStr}</span>
        )}
      </div>

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

      <ScreenshotUpload checkId={checkId} />
    </div>
  );
}
