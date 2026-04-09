import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { tester_id, check_id, comment } = await request.json();

  if (!tester_id || !check_id || !comment?.trim()) {
    return NextResponse.json(
      { error: "tester_id, check_id, and comment are required" },
      { status: 400 }
    );
  }

  const { data, error: dbError } = await supabase
    .from("admin_comments")
    .insert({
      tester_id,
      check_id,
      author_id: tester!.id,
      comment: comment.trim(),
    })
    .select("id, check_id, comment, created_at, author_id")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data });
}
