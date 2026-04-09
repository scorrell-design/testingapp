import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const severity = searchParams.get("severity");
  const assignee = searchParams.get("assignee");

  let query = supabase
    .from("bugs")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (platform) query = query.eq("platform", platform);
  if (severity) query = query.eq("severity", severity);
  if (assignee) query = query.eq("assignee", assignee);

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ bugs: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { check_id, scenario_id, step_title, platform, title, description, severity, assignee } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("bugs")
    .insert({
      check_id: check_id || null,
      scenario_id: scenario_id || null,
      step_title: step_title || null,
      platform: platform || null,
      title,
      description: description || null,
      severity: severity || "P1",
      assignee: assignee || null,
      created_by: tester!.id,
    })
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ bug: data });
}
