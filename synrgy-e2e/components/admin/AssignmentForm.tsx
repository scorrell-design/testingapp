"use client";

import { useState } from "react";
import { scenarios } from "@/lib/scenarios";

type Tester = { id: string; name: string; email: string };

export default function AssignmentForm({
  testers,
  onAssign,
}: {
  testers: Tester[];
  onAssign: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [persona, setPersona] = useState("Tester");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredTesters = email.trim()
    ? testers.filter(
        (t) =>
          t.email.toLowerCase().includes(email.toLowerCase()) ||
          t.name.toLowerCase().includes(email.toLowerCase())
      )
    : testers;

  function toggleScenario(id: string) {
    setSelectedScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || selectedScenarios.length === 0) {
      setError("Email and at least one scenario are required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tester_email: email,
          tester_name: name || undefined,
          scenario_ids: selectedScenarios,
          persona,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create assignment");
        return;
      }
      setEmail("");
      setName("");
      setSelectedScenarios([]);
      setPersona("Tester");
      setNotes("");
      onAssign();
    } catch {
      setError("Failed to create assignment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-4 space-y-4"
    >
      <h3 className="text-sm font-semibold text-gray-900">New assignment</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Team member email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="user@synrgyhealth.com"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
            required
          />
          {showDropdown && filteredTesters.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filteredTesters.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setEmail(t.email);
                    setName(t.name);
                    setShowDropdown(false);
                  }}
                >
                  <span className="font-medium text-gray-800">{t.name}</span>
                  <span className="ml-2 text-gray-400">{t.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Name (for new testers)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Scenarios
        </label>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleScenario(s.id)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={
                selectedScenarios.includes(s.id)
                  ? {
                      borderColor: s.color,
                      backgroundColor: s.bg,
                      color: s.color,
                    }
                  : {
                      borderColor: "#e5e7eb",
                      color: "#6b7280",
                    }
              }
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Persona
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
          >
            <option>Tester</option>
            <option>Admin</option>
            <option>Broker</option>
            <option>Member</option>
            <option>Employer</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context for this assignment..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
          />
        </div>
      </div>

      {error && <p className="text-sm text-status-fail">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-50"
      >
        {saving ? "Assigning…" : "Assign"}
      </button>
    </form>
  );
}
