import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const { data: tester } = await supabase
    .from("testers")
    .select("id, name, email, role, created_at")
    .eq("id", id)
    .single();

  if (!tester) {
    return NextResponse.json({ error: "Tester not found" }, { status: 404 });
  }

  const { data: results } = await supabase
    .from("test_results")
    .select("check_id, status, notes, severity, defect_description, updated_at, round, device")
    .eq("tester_id", id)
    .order("updated_at", { ascending: false });

  const { data: screenshots } = await supabase
    .from("screenshots")
    .select("id, check_id, file_url, file_name, created_at")
    .eq("tester_id", id)
    .order("created_at", { ascending: true });

  const { data: assignments } = await supabase
    .from("assignments")
    .select("scenario_id, persona, status, notes")
    .eq("tester_id", id);

  const { data: comments } = await supabase
    .from("admin_comments")
    .select("id, check_id, comment, created_at, author_id")
    .eq("tester_id", id)
    .order("created_at", { ascending: true });

  const { data: retestRequests } = await supabase
    .from("retest_requests")
    .select("id, check_id, reason, what_to_verify, status, retest_result, created_at")
    .eq("tester_id", id)
    .order("created_at", { ascending: false });

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

  return NextResponse.json({
    tester,
    results: results ?? [],
    screenshotsByCheck,
    commentsByCheck,
    assignments: assignments ?? [],
    retestRequests: retestRequests ?? [],
  });
}
