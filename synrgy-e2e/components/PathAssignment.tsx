"use client";

import { useState, useEffect, useCallback } from "react";
import { getAssignablePaths } from "@/lib/paths";
import type { PathDefinition } from "@/lib/paths";

const assignable = getAssignablePaths();

export default function PathAssignment() {
  const [assigned, setAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadPaths = useCallback(async () => {
    try {
      const res = await fetch("/api/paths");
      if (res.ok) {
        const data = await res.json();
        setAssigned(data.paths ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaths();
  }, [loadPaths]);

  async function togglePath(pathId: string) {
    setToggling(pathId);
    const isAssigned = assigned.includes(pathId);

    try {
      const res = await fetch("/api/paths", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path_id: pathId, action: isAssigned ? "remove" : "assign" }),
      });
      if (res.ok) {
        setAssigned((prev) =>
          isAssigned ? prev.filter((p) => p !== pathId) : [...prev, pathId]
        );
      }
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-400">Loading paths…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">My test paths</h3>

      <div className="space-y-2">
        {/* Core — always assigned */}
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold"
              style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              Core
            </span>
            <span className="text-xs text-gray-500">Happy path — always assigned</span>
          </div>
          <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        {assignable.map((p: PathDefinition) => {
          const isAssigned = assigned.includes(p.id);
          const isLoading = toggling === p.id;

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
              style={{
                borderColor: isAssigned ? p.color + "40" : "#f3f4f6",
                backgroundColor: isAssigned ? p.bg : "white",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  {p.label}
                </span>
                <span className="text-xs text-gray-500">{p.description}</span>
              </div>
              <button
                onClick={() => togglePath(p.id)}
                disabled={isLoading}
                className="shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                style={
                  isAssigned
                    ? {
                        backgroundColor: "white",
                        color: p.color,
                        border: `1px solid ${p.color}40`,
                      }
                    : {
                        backgroundColor: p.color,
                        color: "white",
                        border: `1px solid ${p.color}`,
                      }
                }
              >
                {isLoading
                  ? "…"
                  : isAssigned
                    ? "Remove"
                    : "Assign to me"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
