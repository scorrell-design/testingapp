"use client";

import { useState } from "react";

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

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  P0: { bg: "#FCEBEB", text: "#A32D2D" },
  P1: { bg: "#FAEEDA", text: "#854F0B" },
  P2: { bg: "#F1EFE8", text: "#5F5E5A" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: "#FCEBEB", text: "#A32D2D" },
  in_progress: { bg: "#E6F1FB", text: "#185FA5" },
  fixed: { bg: "#E1F5EE", text: "#0F6E56" },
  wont_fix: { bg: "#F1EFE8", text: "#5F5E5A" },
  deferred: { bg: "#FAEEDA", text: "#854F0B" },
  pending_verification: { bg: "#F0EBFE", text: "#6C3BAA" },
  verified_fixed: { bg: "#E1F5EE", text: "#0F6E56" },
};

export default function BugCard({
  bug,
  onUpdate,
}: {
  bug: Bug;
  onUpdate: (id: string, updates: Partial<Bug>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(bug.status);
  const [assignee, setAssignee] = useState(bug.assignee ?? "");
  const [severity, setSeverity] = useState(bug.severity);

  async function save() {
    onUpdate(bug.id, { status, assignee: assignee || null, severity });
    setEditing(false);
  }

  const sc = SEVERITY_COLORS[bug.severity] ?? SEVERITY_COLORS.P1;
  const stc = STATUS_COLORS[bug.status] ?? STATUS_COLORS.open;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{bug.title}</h4>
          {bug.check_id && (
            <p className="text-[11px] text-gray-400">
              {bug.check_id} · {bug.scenario_id} · {bug.step_title}
            </p>
          )}
        </div>
        <div className="ml-2 flex items-center gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: sc.bg, color: sc.text }}
          >
            {bug.severity}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: stc.bg, color: stc.text }}
          >
            {bug.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {bug.description && (
        <p className="mb-2 text-xs text-gray-600 line-clamp-2">{bug.description}</p>
      )}

      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        {bug.platform && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5">{bug.platform}</span>
        )}
        {bug.assignee && <span>→ {bug.assignee}</span>}
        <span>{new Date(bug.created_at).toLocaleDateString()}</span>
        <button
          onClick={() => setEditing(!editing)}
          className="ml-auto text-brand-navy hover:underline"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {editing && (
        <div className="mt-2 grid gap-2 border-t border-gray-100 pt-2 sm:grid-cols-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 text-xs"
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="fixed">Fixed</option>
            <option value="wont_fix">Won&apos;t fix</option>
            <option value="deferred">Deferred</option>
            <option value="pending_verification">Pending verification</option>
            <option value="verified_fixed">Verified fixed</option>
          </select>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 text-xs"
          >
            <option value="P0">P0 — Critical</option>
            <option value="P1">P1 — Major</option>
            <option value="P2">P2 — Minor</option>
          </select>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee"
            className="rounded border border-gray-200 px-2 py-1 text-xs"
          />
          <button
            onClick={save}
            className="col-span-full rounded bg-brand-navy px-3 py-1 text-xs font-medium text-white sm:col-span-1"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
