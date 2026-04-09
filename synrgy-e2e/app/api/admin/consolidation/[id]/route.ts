import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.check_ids !== undefined) updates.check_ids = body.check_ids;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.bug_id !== undefined) updates.bug_id = body.bug_id;

  const { data, error: dbError } = await supabase
    .from("failure_clusters")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ cluster: data });
}
