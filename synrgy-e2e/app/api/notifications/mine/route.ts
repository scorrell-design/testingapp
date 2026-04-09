import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";

export async function GET() {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("notifications")
    .select("*")
    .eq("tester_id", tester!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data ?? [] });
}
