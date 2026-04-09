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

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.severity !== undefined) updates.severity = body.severity;
  if (body.status !== undefined) updates.status = body.status;
  if (body.assignee !== undefined) updates.assignee = body.assignee;
  if (body.platform !== undefined) updates.platform = body.platform;

  const { data, error: dbError } = await supabase
    .from("bugs")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ bug: data });
}
