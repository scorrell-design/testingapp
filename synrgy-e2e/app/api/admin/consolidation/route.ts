import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { buildClusters } from "@/lib/clustering";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data: results } = await supabase
    .from("test_results")
    .select("tester_id, check_id, status, notes");

  const { data: testers } = await supabase
    .from("testers")
    .select("id, name");

  const testerMap: Record<string, string> = {};
  for (const t of testers ?? []) {
    testerMap[t.id] = t.name;
  }

  const enriched = (results ?? []).map((r) => ({
    tester_id: r.tester_id,
    tester_name: testerMap[r.tester_id] ?? "Unknown",
    check_id: r.check_id,
    status: r.status,
    notes: r.notes,
  }));

  const autoClusters = buildClusters(enriched);

  const { data: savedClusters } = await supabase
    .from("failure_clusters")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    autoClusters,
    savedClusters: savedClusters ?? [],
  });
}

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { title, platform, check_ids, notes, bug_id } = body;

  if (!title || !check_ids?.length) {
    return NextResponse.json(
      { error: "title and check_ids are required" },
      { status: 400 }
    );
  }

  const { data, error: dbError } = await supabase
    .from("failure_clusters")
    .insert({
      title,
      platform: platform || null,
      check_ids,
      notes: notes || null,
      bug_id: bug_id || null,
      created_by: tester!.id,
    })
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ cluster: data });
}
