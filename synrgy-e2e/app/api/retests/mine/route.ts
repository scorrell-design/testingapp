import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/admin-guard";

export async function GET() {
  const { error, tester } = await requireAuth();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("retest_requests")
    .select(`
      id, check_id, scenario_id, reason, what_to_verify,
      original_status, original_notes, priority, status,
      retest_result, retest_notes, created_at, completed_at,
      requester:testers!retest_requests_requested_by_fkey(name)
    `)
    .eq("tester_id", tester!.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
}
