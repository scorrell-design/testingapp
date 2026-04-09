"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import AssignmentForm from "@/components/admin/AssignmentForm";

type Tester = { id: string; name: string; email: string };
type Assignment = {
  id: string;
  scenario_id: string;
  persona: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tester: { id: string; name: string; email: string } | null;
  assigner: { id: string; name: string } | null;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  assigned: { bg: "#E6F1FB", text: "#185FA5" },
  in_progress: { bg: "#FAEEDA", text: "#854F0B" },
  completed: { bg: "#E1F5EE", text: "#0F6E56" },
  needs_retest: { bg: "#FCEBEB", text: "#A32D2D" },
};

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [authRes, assignRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/assignments"),
      ]);

      if (!authRes.ok) {
        router.push("/login");
        return;
      }

      const authData = await authRes.json();
      if (authData.tester?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData.assignments ?? []);
      }

      const testersRes = await fetch("/api/admin/dashboard/testers");
      if (testersRes.ok) {
        const testersData = await testersRes.json();
        setTesters(
          (testersData.testers ?? []).map((t: { id: string; name: string; email: string }) => ({
            id: t.id,
            name: t.name,
            email: t.email,
          }))
        );
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this assignment?")) return;
    await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-xs font-semibold text-white">
              S
            </div>
            <h1 className="text-base font-semibold text-gray-900">
              E2E Testing
            </h1>
            <span className="rounded bg-brand-navy/10 px-2 py-0.5 text-[10px] font-semibold text-brand-navy">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              Tester view
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Test assignments
          </h2>
          <p className="text-sm text-gray-500">
            Assign team members to specific test scenarios and personas
          </p>
        </div>

        <div className="mb-6">
          <AssignmentForm testers={testers} onAssign={load} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  Tester
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  Scenario
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  Persona
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  Assigned by
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                    No assignments yet. Create one above.
                  </td>
                </tr>
              )}
              {assignments.map((a) => {
                const scenario = scenarios.find((s) => s.id === a.scenario_id);
                const sc = STATUS_COLORS[a.status] ?? STATUS_COLORS.assigned;
                return (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-800">
                        {a.tester?.name ?? "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {a.tester?.email}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: scenario?.bg ?? "#f3f4f6",
                          color: scenario?.color ?? "#6b7280",
                        }}
                      >
                        {scenario?.icon} {scenario?.title ?? a.scenario_id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      {a.persona}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {a.assigner?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-xs text-gray-400 hover:text-status-fail"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
