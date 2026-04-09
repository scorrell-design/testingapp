import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";

export async function PUT() {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { error: dbError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("tester_id", tester!.id)
    .eq("is_read", false);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
