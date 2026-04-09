import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sendManualEmail, emailTemplate } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { to, toName, subject, message } = await request.json();

  if (!to || !subject || !message) {
    return NextResponse.json({ error: "to, subject, and message are required" }, { status: 400 });
  }

  const html = emailTemplate({
    preheader: subject,
    greeting: toName ? `Hi ${toName},` : "Hi,",
    mainMessage: message,
  });

  const result = await sendManualEmail({
    to,
    toName,
    subject,
    html,
    sentBy: tester!.id,
  });

  return NextResponse.json({ ok: true, logId: result?.id });
}
