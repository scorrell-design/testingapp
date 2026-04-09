import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const types = searchParams.get("types")?.split(",").filter(Boolean);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase
    .from("email_log")
    .select("id, to_email, to_name, subject, email_type, status, error_message, related_tester_id, related_scenario_id, related_check_id, triggered_by, sent_by, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (types?.length) {
    query = query.in("email_type", types);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(`to_email.ilike.%${search}%,to_name.ilike.%${search}%,subject.ilike.%${search}%`);
  }

  const { data, count, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({
    emails: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
