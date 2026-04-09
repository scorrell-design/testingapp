"use client";

import { useEffect, useState, useCallback } from "react";

type EmailEntry = {
  id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  email_type: string;
  status: string;
  error_message: string | null;
  triggered_by: string;
  created_at: string;
};

const TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  assignment: { bg: "#DBEAFE", color: "#1E40AF", label: "Assignment" },
  completion: { bg: "#D1FAE5", color: "#065F46", label: "Completion" },
  retest_request: { bg: "#FEF3C7", color: "#92400E", label: "Retest request" },
  retest_completed: { bg: "#EDE9FE", color: "#5B21B6", label: "Retest completed" },
  manual: { bg: "#F3F4F6", color: "#374151", label: "Manual" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function EmailLogTable({ refreshKey }: { refreshKey: number }) {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [resending, setResending] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (filterTypes.length) params.set("types", filterTypes.join(","));
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/email-log?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails ?? []);
      setTotalPages(data.totalPages ?? 1);
    }
  }, [page, filterTypes, filterStatus, search]);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function handleResend(id: string) {
    setResending(id);
    await fetch(`/api/admin/email-log/resend/${id}`, { method: "POST" });
    setResending(null);
    load();
  }

  async function handleView(id: string) {
    setPreviewId(id);
    const res = await fetch(`/api/admin/email-log/${id}`);
    if (res.ok) {
      const data = await res.json();
      const email = data.email;
      if (email?.html) {
        setPreviewHtml(email.html);
      } else {
        setPreviewHtml(`<div style="padding: 16px; font-family: sans-serif;">
          <p><strong>To:</strong> ${email?.to_name || ""} &lt;${email?.to_email}&gt;</p>
          <p><strong>Subject:</strong> ${email?.subject}</p>
          <p><strong>Type:</strong> ${email?.email_type}</p>
          <p><strong>Status:</strong> ${email?.status}</p>
          <p><strong>Sent:</strong> ${new Date(email?.created_at).toLocaleString()}</p>
          ${email?.error_message ? `<p style="color: red;"><strong>Error:</strong> ${email.error_message}</p>` : ""}
        </div>`);
      }
    }
  }

  function toggleType(type: string) {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search emails..."
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#005F78] w-48"
        />
        <div className="flex gap-1">
          {Object.entries(TYPE_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => toggleType(key)}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity"
              style={{
                backgroundColor: style.bg,
                color: style.color,
                opacity: filterTypes.length === 0 || filterTypes.includes(key) ? 1 : 0.4,
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded border border-gray-200 px-2 py-1 text-xs"
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-500">Status</th>
              <th className="px-3 py-2 font-medium text-gray-500">Type</th>
              <th className="px-3 py-2 font-medium text-gray-500">To</th>
              <th className="px-3 py-2 font-medium text-gray-500">Subject</th>
              <th className="px-3 py-2 font-medium text-gray-500">Trigger</th>
              <th className="px-3 py-2 font-medium text-gray-500">Sent</th>
              <th className="px-3 py-2 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => {
              const typeStyle = TYPE_STYLES[email.email_type] || TYPE_STYLES.manual;
              const isFailed = email.status === "failed";
              return (
                <tr
                  key={email.id}
                  className={`border-b border-gray-50 ${isFailed ? "bg-red-50/50" : ""}`}
                  title={isFailed && email.error_message ? email.error_message : undefined}
                >
                  <td className="px-3 py-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          email.status === "sent" ? "#0F6E56" :
                          email.status === "failed" ? "#A32D2D" : "#9ca3af",
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
                    >
                      {typeStyle.label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      {email.to_name && (
                        <span className="font-medium text-gray-900">{email.to_name} </span>
                      )}
                      <span className="text-gray-500">{email.to_email}</span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-gray-700">
                    {email.subject}
                  </td>
                  <td className="px-3 py-2 text-gray-500 capitalize">
                    {email.triggered_by}
                  </td>
                  <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                    {timeAgo(email.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleResend(email.id)}
                        disabled={resending === email.id}
                        className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {resending === email.id ? "..." : "Resend"}
                      </button>
                      <button
                        onClick={() => handleView(email.id)}
                        className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-50"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {emails.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  No emails sent yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border border-gray-200 px-2 py-1 text-xs disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded border border-gray-200 px-2 py-1 text-xs disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {previewId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Email details</h3>
              <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
