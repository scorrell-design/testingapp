"use client";

import { useEffect, useState, useCallback } from "react";
import AutomationToggles from "./AutomationToggles";
import EmailLogTable from "./EmailLogTable";
import ManualEmailComposer from "./ManualEmailComposer";
import NudgeCard from "./NudgeCard";
import PendingRetestsCard from "./PendingRetestsCard";

type EmailSetting = { setting_key: string; enabled: boolean };

export default function NotificationsTab() {
  const [settings, setSettings] = useState<EmailSetting[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/email-settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings ?? []);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  async function toggleSetting(key: string, enabled: boolean) {
    const res = await fetch("/api/admin/email-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, enabled }),
    });
    if (res.ok) {
      setSettings((prev) =>
        prev.map((s) => (s.setting_key === key ? { ...s, enabled } : s))
      );
    }
  }

  function handleEmailSent() {
    setRefreshKey((k) => k + 1);
    setShowComposer(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Email Notifications</h2>
        <button
          onClick={() => setShowComposer(true)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: "#005F78" }}
        >
          Send manual email
        </button>
      </div>

      <AutomationToggles settings={settings} onToggle={toggleSetting} />

      <div className="mt-6">
        <EmailLogTable refreshKey={refreshKey} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <NudgeCard onSent={() => setRefreshKey((k) => k + 1)} />
        <PendingRetestsCard onSent={() => setRefreshKey((k) => k + 1)} />
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Notify all testers</h4>
          <p className="mb-3 text-xs text-gray-500">
            Send a custom message to every active tester at once.
          </p>
          <button
            onClick={() => setShowComposer(true)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Compose broadcast
          </button>
        </div>
      </div>

      {showComposer && (
        <ManualEmailComposer
          onClose={() => setShowComposer(false)}
          onSent={handleEmailSent}
        />
      )}
    </div>
  );
}
