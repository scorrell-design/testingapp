"use client";

import { useState, useEffect } from "react";

type Tester = { id: string; name: string; email: string };

export default function ManualEmailComposer({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: () => void;
}) {
  const [testers, setTesters] = useState<Tester[]>([]);
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dashboard/testers")
      .then((r) => r.json())
      .then((d) => setTesters((d.testers ?? []).map((t: Tester) => ({ id: t.id, name: t.name, email: t.email }))))
      .catch(() => {});
  }, []);

  function handleTesterSelect(email: string) {
    setTo(email);
    const t = testers.find((te) => te.email === email);
    setToName(t?.name ?? "");
  }

  async function handleSend() {
    if (!subject || !message) return;
    setSending(true);

    if (isBroadcast) {
      await fetch("/api/admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
    } else {
      if (!to) { setSending(false); return; }
      await fetch("/api/admin/email/send-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, toName, subject, message }),
      });
    }

    setSending(false);
    onSent();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {isBroadcast ? "Broadcast to all testers" : "Send manual email"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-3 p-4">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={isBroadcast}
              onChange={(e) => setIsBroadcast(e.target.checked)}
              className="rounded"
            />
            Send to all active testers
          </label>

          {!isBroadcast && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">To</label>
              <select
                value={to}
                onChange={(e) => handleTesterSelect(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#005F78]"
              >
                <option value="">Select tester...</option>
                {testers.map((t) => (
                  <option key={t.id} value={t.email}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Or type a custom email"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#005F78]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#005F78]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message (will be wrapped in SYNRGY branded template)"
              rows={5}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#005F78]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject || !message || (!isBroadcast && !to)}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#005F78" }}
          >
            {sending ? "Sending..." : isBroadcast ? "Send to all" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
