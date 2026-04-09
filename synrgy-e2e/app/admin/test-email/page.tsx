"use client";

import { useState } from "react";
import Link from "next/link";

type EmailType = "assignment" | "completion" | "retest-request" | "retest-complete";

const EMAIL_TYPES: { type: EmailType; label: string; description: string }[] = [
  {
    type: "assignment",
    label: "Test assignment email",
    description: "Sends the email a tester receives when assigned to scenario(s)",
  },
  {
    type: "completion",
    label: "Test completion email",
    description: "Sends the email an admin receives when a tester finishes all checkpoints",
  },
  {
    type: "retest-request",
    label: "Test retest request email",
    description: "Sends the email a tester receives when asked to re-verify a checkpoint",
  },
  {
    type: "retest-complete",
    label: "Test retest completed email",
    description: "Sends the email an admin receives when a tester completes a retest",
  },
];

export default function TestEmailPage() {
  const [sending, setSending] = useState<EmailType | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; message: string }>>({});

  async function sendTest(type: EmailType) {
    setSending(type);
    setResults((prev) => ({ ...prev, [type]: { ok: false, message: "" } }));

    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();

      if (res.ok) {
        setResults((prev) => ({
          ...prev,
          [type]: { ok: true, message: `Sent to ${data.sent_to}` },
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          [type]: { ok: false, message: data.error || "Failed" },
        }));
      }
    } catch {
      setResults((prev) => ({
        ...prev,
        [type]: { ok: false, message: "Network error" },
      }));
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
            &larr; Admin
          </Link>
          <h1 className="text-sm font-semibold text-gray-900">Test Email Notifications</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            Each button sends a test email with dummy data to your logged-in email address. Check your inbox (and spam folder) after clicking.
          </p>
        </div>

        <div className="space-y-3">
          {EMAIL_TYPES.map(({ type, label, description }) => {
            const result = results[type];
            const isLoading = sending === type;

            return (
              <div
                key={type}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                  {result && (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        result.ok ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.ok ? "✓" : "✗"} {result.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => sendTest(type)}
                  disabled={isLoading}
                  className="ml-4 shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#005F78" }}
                >
                  {isLoading ? "Sending…" : "Send"}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
