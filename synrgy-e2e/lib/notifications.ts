import { supabase } from "./supabase";

export async function sendAssignmentEmail({
  testerEmail,
  testerName,
  scenarioTitle,
  adminNotes,
}: {
  testerEmail: string;
  testerName: string;
  scenarioTitle: string;
  adminNotes?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "SYNRGY QA <qa@synrgyhealth.com>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (!apiKey) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const notesSection = adminNotes
      ? `<div style="background: #F3F4F6; border-left: 4px solid #1A3A5C; padding: 12px; margin: 16px 0; border-radius: 4px;">
           <p style="margin: 0 0 4px; font-weight: 600; color: #374151; font-size: 13px;">Notes from your admin:</p>
           <p style="margin: 0; color: #6b7280; font-size: 13px;">${adminNotes}</p>
         </div>`
      : "";

    await resend.emails.send({
      from: fromEmail,
      to: testerEmail,
      subject: `You've been assigned to test: ${scenarioTitle}`,
      html: `
        <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1A3A5C; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 16px;">SYNRGY E2E Testing</h1>
          </div>
          <div style="background: white; border: 1px solid #e5e7eb; border-top: 0; padding: 24px 20px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 14px; margin-top: 0;">Hi ${testerName},</p>
            <p style="color: #374151; font-size: 14px;">You&rsquo;ve been assigned to test the <strong>${scenarioTitle}</strong> flow.</p>
            ${notesSection}
            <a href="${appUrl}/dashboard" style="display: inline-block; background: #1A3A5C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 8px;">
              Start testing &rarr;
            </a>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Questions? Reply to this email or reach out to your test admin.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send assignment email:", err);
  }
}

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
  adminName,
  checkpointText,
  reason,
  whatToVerify,
  originalNotes,
  appLink,
}: {
  testerEmail: string;
  testerName: string;
  adminName?: string;
  checkpointText: string;
  reason: string;
  whatToVerify: string;
  originalNotes?: string | null;
  appLink: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "SYNRGY QA <qa@synrgyhealth.com>";

  if (!apiKey) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const originalSection = originalNotes
      ? `<div style="margin: 16px 0;">
           <p style="font-weight: 600; color: #374151; font-size: 13px;">Original issue:</p>
           <p style="color: #6b7280; font-size: 13px; background: #F9FAFB; padding: 8px 12px; border-radius: 6px; border: 1px solid #E5E7EB;">${originalNotes}</p>
         </div>`
      : "";

    const adminLabel = adminName || "Your admin";

    await resend.emails.send({
      from: fromEmail,
      to: testerEmail,
      subject: `Retest requested: ${checkpointText.slice(0, 60)}`,
      html: `
        <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1A3A5C; color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 16px;">SYNRGY E2E Testing &mdash; Retest Needed</h1>
          </div>
          <div style="background: white; border: 1px solid #e5e7eb; border-top: 0; padding: 24px 20px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 14px; margin-top: 0;">Hi ${testerName},</p>
            <p style="color: #374151; font-size: 14px;">A fix has been deployed and ${adminLabel} is asking you to re-verify a test checkpoint.</p>
            <div style="background: #FEF3D5; border-left: 4px solid #F5C842; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #854F0B;">What was fixed:</p>
              <p style="margin: 0; color: #374151; font-size: 13px;">${reason}</p>
            </div>
            <div style="margin: 16px 0;">
              <p style="font-weight: 600; color: #374151; font-size: 13px;">What to verify:</p>
              <p style="color: #6b7280; font-size: 13px;">${whatToVerify}</p>
            </div>
            ${originalSection}
            <a href="${appLink}" style="display: inline-block; background: #1A3A5C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 8px;">
              Go to retest &rarr;
            </a>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Questions? Reply to this email or reach out to your test admin.</p>
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
