import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sendEmail } from "@/lib/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const { data: original } = await supabase
    .from("email_log")
    .select("to_email, to_name, subject, html, email_type, related_tester_id, related_scenario_id, related_check_id")
    .eq("id", id)
    .single();

  if (!original || !original.html) {
    return NextResponse.json({ error: "Email not found or has no HTML content" }, { status: 404 });
  }

  const result = await sendEmail(original.to_email, original.subject, original.html, {
    type: original.email_type,
    toName: original.to_name || undefined,
    testerId: original.related_tester_id || undefined,
    scenarioId: original.related_scenario_id || undefined,
    checkId: original.related_check_id || undefined,
    sentBy: tester!.id,
    triggeredBy: "manual",
  });

  return NextResponse.json({ ok: true, logId: result?.id });
}
