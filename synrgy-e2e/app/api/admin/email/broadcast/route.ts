import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sendBroadcastEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { subject, message } = await request.json();

  if (!subject || !message) {
    return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
  }

  const { data: testers } = await supabase
    .from("testers")
    .select("id, name, email")
    .neq("role", "admin");

  let sent = 0;
  for (const t of testers ?? []) {
    await sendBroadcastEmail({
      testerEmail: t.email,
      testerName: t.name,
      subject,
      message,
      sentBy: tester!.id,
    });
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
