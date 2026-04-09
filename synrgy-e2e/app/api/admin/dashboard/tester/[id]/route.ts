import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { getSignedUrl } from "@/lib/evidence";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const [
    { data: tester },
    { data: results },
    { data: screenshots },
    { data: assignments },
    { data: comments },
    { data: retestRequests },
    { data: evidence },
    { data: testNotes },
  ] = await Promise.all([
    supabase
      .from("testers")
      .select("id, name, email, role, created_at")
      .eq("id", id)
      .single(),
    supabase
      .from("test_results")
      .select("check_id, status, notes, severity, defect_description, updated_at, round, device")
      .eq("tester_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("screenshots")
      .select("id, check_id, file_url, file_name, created_at")
      .eq("tester_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("assignments")
      .select("scenario_id, persona, status, notes")
      .eq("tester_id", id),
    supabase
      .from("admin_comments")
      .select("id, check_id, comment, created_at, author_id")
      .eq("tester_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("retest_requests")
      .select("id, check_id, reason, what_to_verify, status, retest_result, retest_notes, created_at")
      .eq("tester_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("test_evidence")
      .select("id, check_id, file_path, file_name, file_type, caption, created_at")
      .eq("tester_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("test_notes")
      .select("scenario_id, step_index, note, created_at")
      .eq("tester_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!tester) {
    return NextResponse.json({ error: "Tester not found" }, { status: 404 });
  }

  const screenshotsByCheck: Record<string, typeof screenshots> = {};
  for (const s of screenshots ?? []) {
    if (!screenshotsByCheck[s.check_id]) screenshotsByCheck[s.check_id] = [];
    screenshotsByCheck[s.check_id]!.push(s);
  }

  const commentsByCheck: Record<string, typeof comments> = {};
  for (const c of comments ?? []) {
    if (!commentsByCheck[c.check_id]) commentsByCheck[c.check_id] = [];
    commentsByCheck[c.check_id]!.push(c);
  }

  const evidenceByCheck: Record<string, Array<{
    id: string; file_path: string; file_name: string;
    file_type: string; caption: string | null; created_at: string; url: string | null;
  }>> = {};
  for (const e of evidence ?? []) {
    if (!evidenceByCheck[e.check_id]) evidenceByCheck[e.check_id] = [];
    const url = await getSignedUrl(e.file_path);
    evidenceByCheck[e.check_id].push({ ...e, url });
  }

  const notesByScenarioStep: Record<string, Record<number, string>> = {};
  for (const n of testNotes ?? []) {
    if (!notesByScenarioStep[n.scenario_id]) notesByScenarioStep[n.scenario_id] = {};
    if (!notesByScenarioStep[n.scenario_id][n.step_index]) {
      notesByScenarioStep[n.scenario_id][n.step_index] = n.note;
    }
  }

  return NextResponse.json({
    tester,
    results: results ?? [],
    screenshotsByCheck,
    commentsByCheck,
    evidenceByCheck,
    notesByScenarioStep,
    assignments: assignments ?? [],
    retestRequests: retestRequests ?? [],
  });
}
