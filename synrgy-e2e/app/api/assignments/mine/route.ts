import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";

export async function GET() {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("assignments")
    .select(`
      id, scenario_id, persona, notes, status, created_at,
      assigner:testers!assignments_assigned_by_fkey(name)
    `)
    .eq("tester_id", tester!.id)
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: data ?? [] });
}
