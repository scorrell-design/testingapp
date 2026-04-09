import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("email_settings")
    .select("setting_key, enabled, updated_at")
    .order("setting_key");

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data ?? [] });
}

export async function PUT(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { key, enabled } = await request.json();

  if (!key || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "key and enabled are required" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("email_settings")
    .update({ enabled, updated_by: tester!.id, updated_at: new Date().toISOString() })
    .eq("setting_key", key)
    .select("setting_key, enabled, updated_at")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ setting: data });
}
