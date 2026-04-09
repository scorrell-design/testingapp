import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const { error: dbError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("tester_id", tester!.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
