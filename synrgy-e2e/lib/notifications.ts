import { supabase } from "./supabase";

export async function createNotification({
  testerId,
  type,
  title,
  body,
  link,
}: {
  testerId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      tester_id: testerId,
      type,
      title,
      body: body || null,
      link: link || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create notification:", error);
    return null;
  }

  return data;
}

export async function sendRetestEmail({
  testerEmail,
  testerName,
  checkpointText,
  reason,
  whatToVerify,
  appLink,
}: {
  testerEmail: string;
  testerName: string;
  checkpointText: string;
  reason: string;
  whatToVerify: string;
  appLink: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "qa@synrgyhealth.com";

  if (!apiKey) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: fromEmail,
      to: testerEmail,
      subject: `SYNRGY QA: Retest requested — ${checkpointText.slice(0, 60)}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1A3A5C; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 16px;">SYNRGY E2E Testing — Retest Request</h1>
          </div>
          <div style="background: white; border: 1px solid #e5e7eb; border-top: 0; padding: 20px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 14px;">Hi ${testerName},</p>
            <p style="color: #374151; font-size: 14px;">A checkpoint needs to be retested:</p>
            <div style="background: #FEF3D5; border-left: 4px solid #F5C842; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #854F0B;">Checkpoint</p>
              <p style="margin: 0; color: #374151; font-size: 13px;">${checkpointText}</p>
            </div>
            <div style="margin: 16px 0;">
              <p style="font-weight: 600; color: #374151; font-size: 13px;">What was fixed:</p>
              <p style="color: #6b7280; font-size: 13px;">${reason}</p>
            </div>
            <div style="margin: 16px 0;">
              <p style="font-weight: 600; color: #374151; font-size: 13px;">What to verify:</p>
              <p style="color: #6b7280; font-size: 13px;">${whatToVerify}</p>
            </div>
            <a href="${appLink}" style="display: inline-block; background: #1A3A5C; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Go to test →
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send retest email:", err);
  }
}

export async function sendSlackNotification({
  text,
}: {
  text: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("Failed to send Slack notification:", err);
  }
}
