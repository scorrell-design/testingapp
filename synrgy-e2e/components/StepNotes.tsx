"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

export default function StepNotes({
  scenarioId,
  stepIndex,
}: {
  scenarioId: string;
  stepIndex: number;
}) {
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoaded(false);
    setIsFocused(false);
    fetch(`/api/notes?scenario_id=${scenarioId}&step_index=${stepIndex}`)
      .then((r) => r.json())
      .then((data) => {
        setNote(data.note ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [scenarioId, stepIndex]);

  const saveNote = useCallback(
    async (value: string) => {
      setSaving(true);
      try {
        await fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario_id: scenarioId,
            step_index: stepIndex,
            note: value,
          }),
        });
      } finally {
        setSaving(false);
      }
    },
    [scenarioId, stepIndex]
  );

  function handleChange(value: string) {
    setNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNote(value), 1000);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!loaded) return null;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Step notes
        </p>
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
      </div>
      {isFocused ? (
        <textarea
          value={note}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add general notes for this step… Use @bug, @question, or @blocker for quick tags"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsFocused(true)}
          className="min-h-[68px] cursor-text rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 transition-colors hover:border-gray-300"
        >
          {note ? (
            <span className="whitespace-pre-wrap">{renderNotesWithTags(note)}</span>
          ) : (
            <span className="text-gray-400">
              Add general notes for this step… Use @bug, @question, or @blocker for quick tags
            </span>
          )}
        </div>
      )}
    </div>
  );
}
