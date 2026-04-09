"use client";

const TABS = [
  { id: "progress", label: "Progress", icon: "📊" },
  { id: "systems", label: "By System", icon: "🖥" },
  { id: "bugs", label: "Bug Tracker", icon: "🐛" },
  { id: "consolidation", label: "Consolidation", icon: "🔗" },
] as const;

export type AdminTab = (typeof TABS)[number]["id"];

export default function AdminNav({
  active,
  onChange,
}: {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            active === tab.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
