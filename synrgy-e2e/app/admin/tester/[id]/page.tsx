"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios";

type TesterResult = {
  check_id: string;
  status: string;
  notes: string | null;
  severity: string | null;
  defect_description: string | null;
  updated_at: string;
  round: number;
};

type Screenshot = {
  id: string;
  file_url: string;
  file_name: string;
  created_at: string;
};

type Comment = {
  id: string;
  check_id: string;
  comment: string;
  created_at: string;
};

type RetestReq = {
  id: string;
  check_id: string;
  reason: string;
  what_to_verify: string;
  status: string;
  retest_result: string | null;
  created_at: string;
};

type Evidence = {
  id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  caption: string | null;
  created_at: string;
  url: string | null;
};

type Assignment = {
  scenario_id: string;
  persona: string;
  status: string;
  notes: string | null;
};

type TesterInfo = { id: string; name: string; email: string; role?: string; created_at?: string };

export default function TesterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tester, setTester] = useState<TesterInfo | null>(null);
  const [results, setResults] = useState<TesterResult[]>([]);
  const [screenshotsByCheck, setScreenshotsByCheck] = useState<Record<string, Screenshot[]>>({});
  const [commentsByCheck, setCommentsByCheck] = useState<Record<string, Comment[]>>({});
  const [evidenceByCheck, setEvidenceByCheck] = useState<Record<string, Evidence[]>>({});
  const [notesByScenarioStep, setNotesByScenarioStep] = useState<Record<string, Record<number, string>>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [retestRequests, setRetestRequests] = useState<RetestReq[]>([]);
  const [filterScenario, setFilterScenario] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/admin/dashboard/tester/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        setTester(data.tester);
        setResults(data.results ?? []);
        setScreenshotsByCheck(data.screenshotsByCheck ?? {});
        setCommentsByCheck(data.commentsByCheck ?? {});
        setEvidenceByCheck(data.evidenceByCheck ?? {});
        setNotesByScenarioStep(data.notesByScenarioStep ?? {});
        setAssignments(data.assignments ?? []);
        setRetestRequests(data.retestRequests ?? []);
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleRequestRetest(checkId: string) {
    const reason = prompt("What was fixed?");
    if (!reason) return;
    const whatToVerify = prompt("What should the tester verify?");
    if (!whatToVerify) return;

    const result = results.find((r) => r.check_id === checkId);
    const scenarioId = findScenarioForCheck(checkId);

    await fetch("/api/admin/retest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tester_id: id,
        check_id: checkId,
        scenario_id: scenarioId,
        reason,
        what_to_verify: whatToVerify,
        original_status: result?.status,
        original_notes: result?.notes,
      }),
    });

    alert("Retest requested!");
  }

  async function handleAddComment(checkId: string) {
    const text = newComment[checkId];
    if (!text?.trim()) return;

    const res = await fetch("/api/admin/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tester_id: id, check_id: checkId, comment: text }),
    });

    if (res.ok) {
      const data = await res.json();
      setCommentsByCheck((prev) => ({
        ...prev,
        [checkId]: [...(prev[checkId] ?? []), data.comment],
      }));
      setNewComment((prev) => ({ ...prev, [checkId]: "" }));
    }
  }

  function findScenarioForCheck(checkId: string): string {
    for (const s of scenarios) {
      for (const step of s.steps) {
        if (step.checks.some((c) => c.id === checkId)) return s.id;
      }
    }
    return "";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  const resultMap: Record<string, TesterResult> = {};
  for (const r of results) resultMap[r.check_id] = r;

  const filteredScenarios = scenarios.filter((s) => {
    if (filterScenario && s.id !== filterScenario) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">&larr; Admin</Link>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-semibold text-brand-navy">
                {tester?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-gray-900">{tester?.name}</h1>
                  {tester?.role === "admin" && (
                    <span className="rounded-full bg-brand-navy/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-navy">Admin</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {tester?.email}
                  {tester?.created_at && (
                    <span className="ml-2 text-gray-300">&middot; Joined {new Date(tester.created_at).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterScenario}
                onChange={(e) => setFilterScenario(e.target.value)}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="">All scenarios</option>
                {scenarios.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="">All statuses</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="blocked">Blocked</option>
                <option value="skip">Skip</option>
              </select>
            </div>
          </div>

          {assignments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {assignments.map((a) => {
                const s = scenarios.find((sc) => sc.id === a.scenario_id);
                return (
                  <span
                    key={a.scenario_id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: s?.bg ?? "#f3f4f6",
                      color: s?.color ?? "#6b7280",
                    }}
                  >
                    {s?.icon ?? ""} {s?.title ?? a.scenario_id} &middot; {a.persona}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {filteredScenarios.map((scenario) => {
          const scenarioNotes = notesByScenarioStep[scenario.id] ?? {};
          const stepsWithData = scenario.steps.map((step, stepIdx) => {
            const checksWithResults = step.checks
              .filter((c) => resultMap[c.id])
              .filter((c) => !filterStatus || resultMap[c.id].status === filterStatus)
              .map((c) => ({ check: c, result: resultMap[c.id] }));
            const stepNote = scenarioNotes[stepIdx] ?? null;
            return { step, stepIdx, checksWithResults, stepNote };
          }).filter((s) => s.checksWithResults.length > 0 || s.stepNote);

          if (stepsWithData.length === 0) return null;

          const totalResults = stepsWithData.reduce((sum, s) => sum + s.checksWithResults.length, 0);

          return (
            <div key={scenario.id} className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded text-xs text-white"
                  style={{ backgroundColor: scenario.color }}
                >
                  {scenario.icon}
                </span>
                {scenario.title}
                <span className="text-xs font-normal text-gray-400">({totalResults} results)</span>
              </h3>

              {stepsWithData.map(({ step, stepIdx, checksWithResults, stepNote }) => (
                <div key={stepIdx} className="mb-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-600">Step {stepIdx + 1}: {step.title}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{step.platform}</span>
                  </div>

                  {stepNote && (
                    <div className="mb-2 rounded border border-blue-100 bg-blue-50/50 px-2 py-1.5">
                      <p className="text-[10px] font-medium text-blue-700 mb-0.5">Tester step notes:</p>
                      <p className="text-[11px] text-blue-900">{stepNote}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {checksWithResults.map(({ check, result }) => {
                      const screenshots = screenshotsByCheck[check.id] ?? [];
                      const evidenceItems = evidenceByCheck[check.id] ?? [];
                      const comments = commentsByCheck[check.id] ?? [];
                      const retests = retestRequests.filter((r) => r.check_id === check.id);
                      const isFail = result.status === "fail" || result.status === "retest_fail";

                      return (
                        <div key={check.id} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-medium text-gray-400">{check.id}</span>
                              </div>
                              <p className="text-xs text-gray-800">{check.text}</p>
                            </div>
                            <div className="ml-2 flex items-center gap-1">
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{
                                  backgroundColor:
                                    result.status === "pass" || result.status === "retest_pass" ? "#E1F5EE" :
                                    result.status === "fail" || result.status === "retest_fail" ? "#FCEBEB" :
                                    result.status === "blocked" ? "#FAEEDA" : "#F1EFE8",
                                  color:
                                    result.status === "pass" || result.status === "retest_pass" ? "#0F6E56" :
                                    result.status === "fail" || result.status === "retest_fail" ? "#A32D2D" :
                                    result.status === "blocked" ? "#854F0B" : "#5F5E5A",
                                }}
                              >
                                {result.status}
                              </span>
                              <span className="text-[10px] text-gray-400">R{result.round}</span>
                            </div>
                          </div>

                          {result.notes && (
                            <p className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              {result.notes}
                            </p>
                          )}

                          {result.defect_description && (
                            <p className="mt-1 text-xs text-status-fail bg-status-fail-light rounded px-2 py-1">
                              {result.severity && <span className="font-semibold">[{result.severity}] </span>}
                              {result.defect_description}
                            </p>
                          )}

                          {screenshots.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {screenshots.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => setLightbox(s.file_url)}
                                  className="h-12 overflow-hidden rounded border border-gray-200"
                                >
                                  <img src={s.file_url} alt={s.file_name} className="h-full w-auto object-cover" />
                                </button>
                              ))}
                            </div>
                          )}

                          {evidenceItems.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {evidenceItems.map((ev) => (
                                <button
                                  key={ev.id}
                                  onClick={() => ev.url && setLightbox(ev.url)}
                                  className="h-12 overflow-hidden rounded border border-gray-200"
                                  title={ev.caption || ev.file_name}
                                >
                                  {ev.file_type?.startsWith("image/") && ev.url ? (
                                    <img src={ev.url} alt={ev.file_name} className="h-full w-auto object-cover" />
                                  ) : (
                                    <div className="flex h-full items-center px-2 text-[10px] text-gray-500">{ev.file_name}</div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {comments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {comments.map((c) => (
                                <p key={c.id} className="text-[11px] text-gray-600 bg-blue-50 rounded px-2 py-1">
                                  <span className="mr-1">💬</span>{c.comment}
                                  <span className="ml-1 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {retests.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {retests.map((rt) => (
                                <div key={rt.id} className="text-[11px] rounded bg-amber-50 px-2 py-1">
                                  <span className="font-medium text-amber-800">Retest: </span>
                                  <span className="text-amber-700">{rt.reason}</span>
                                  {rt.retest_result && (
                                    <span className={`ml-1 font-semibold ${rt.retest_result === "pass" ? "text-status-pass" : "text-status-fail"}`}>
                                      &rarr; {rt.retest_result}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            <input
                              value={newComment[check.id] ?? ""}
                              onChange={(e) => setNewComment((p) => ({ ...p, [check.id]: e.target.value }))}
                              placeholder="Add comment…"
                              className="flex-1 rounded border border-gray-200 px-2 py-1 text-[11px]"
                              onKeyDown={(e) => e.key === "Enter" && handleAddComment(check.id)}
                            />
                            <button
                              onClick={() => handleAddComment(check.id)}
                              className="text-[10px] text-brand-navy hover:underline"
                            >
                              Comment
                            </button>
                            {isFail && (
                              <button
                                onClick={() => handleRequestRetest(check.id)}
                                className="text-[10px] text-amber-700 hover:underline"
                              >
                                Request retest
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </main>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="Screenshot" className="max-h-[85vh] max-w-full rounded-lg object-contain" />
            <button onClick={() => setLightbox(null)} className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
