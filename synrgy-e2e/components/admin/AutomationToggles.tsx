"use client";

import { useState } from "react";

type Setting = { setting_key: string; enabled: boolean };

const TOGGLE_INFO: Record<string, { label: string; description: string }> = {
  auto_assignment_email: {
    label: "Tester assigned",
    description: "Automatically email testers when they are assigned a scenario",
  },
  auto_completion_email: {
    label: "Testing complete",
    description: "Automatically email admins when a tester finishes all checkpoints",
  },
  auto_retest_request_email: {
    label: "Retest requested",
    description: "Automatically email testers when an admin requests a retest",
  },
  auto_retest_completed_email: {
    label: "Retest completed",
    description: "Automatically email admins when a tester finishes a retest",
  },
};

export default function AutomationToggles({
  settings,
  onToggle,
}: {
  settings: Setting[];
  onToggle: (key: string, enabled: boolean) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  function handleToggle(key: string, currentEnabled: boolean) {
    const newEnabled = !currentEnabled;
    onToggle(key, newEnabled);
    const info = TOGGLE_INFO[key];
    setToast(`${info?.label ?? key} ${newEnabled ? "enabled" : "paused"}`);
    setTimeout(() => setToast(null), 2500);
  }

  const orderedKeys = [
    "auto_assignment_email",
    "auto_completion_email",
    "auto_retest_request_email",
    "auto_retest_completed_email",
  ];

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Automation triggers</h3>
      <div className="space-y-3">
        {orderedKeys.map((key) => {
          const setting = settings.find((s) => s.setting_key === key);
          const enabled = setting?.enabled ?? true;
          const info = TOGGLE_INFO[key];
          if (!info) return null;

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: enabled ? "#0F6E56" : "#d1d5db" }}
                />
                <div>
                  <p className="text-xs font-medium text-gray-900">{info.label}</p>
                  <p className="text-[11px] text-gray-500">{info.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(key, enabled)}
                className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
                style={{ backgroundColor: enabled ? "#005F78" : "#d1d5db" }}
              >
                <span
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                  style={{ left: enabled ? "18px" : "2px" }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
