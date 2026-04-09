import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

const BRAND = "#005F78";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailTemplate(content: {
  preheader: string;
  greeting: string;
  mainMessage: string;
  sections?: { label: string; text: string }[];
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  const sectionsHtml = (content.sections ?? [])
    .map(
      (s) => `
      <div style="margin: 16px 0;">
        <p style="margin: 0 0 4px; font-weight: 600; color: #374151; font-size: 13px;">${esc(s.label)}</p>
        <p style="margin: 0; color: #4b5563; font-size: 13px; background: #f9fafb; padding: 10px 12px; border-radius: 6px; border: 1px solid #e5e7eb; line-height: 1.5;">${esc(s.text)}</p>
      </div>`
    )
    .join("");

  const ctaHtml = content.ctaText && content.ctaUrl
    ? `<div style="text-align: center; margin: 24px 0 8px;">
        <a href="${content.ctaUrl}" style="display: inline-block; background: ${BRAND}; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">${esc(content.ctaText)}</a>
       </div>`
    : "";

  const footerText = content.footer || "This is an automated notification from SYNRGY E2E Testing.";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<div style="display: none; max-height: 0; overflow: hidden;">${esc(content.preheader)}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 24px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
  <tr><td style="background: ${BRAND}; color: #ffffff; padding: 16px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 16px; font-weight: 600;">SYNRGY E2E Testing</h1>
  </td></tr>
  <tr><td style="background: #ffffff; border: 1px solid #e5e7eb; border-top: 0; padding: 28px 24px; border-radius: 0 0 12px 12px;">
    <p style="color: #374151; font-size: 14px; margin: 0 0 12px; line-height: 1.5;">${esc(content.greeting)}</p>
    <p style="color: #374151; font-size: 14px; margin: 0 0 4px; line-height: 1.5;">${content.mainMessage}</p>
    ${sectionsHtml}
    ${ctaHtml}
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">${esc(footerText)}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!resend) {
    console.log("[email] Resend not configured, skipping:", subject);
    return;
  }
  const recipients = Array.isArray(to) ? to : [to];
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject,
      html,
    });
  } catch (error) {
    console.error("[email] Failed to send:", error);
  }
}

// ─── EMAIL 1: Tester assigned to scenario(s) ─────────────────────

export async function sendAssignmentEmail(opts: {
  testerEmail: string;
  testerName: string;
  adminName: string;
  scenarioTitles: { title: string; summary: string }[];
  persona: string;
  adminNotes?: string | null;
}) {
  const scenarioList = opts.scenarioTitles
    .map((s) => `${s.title} — ${s.summary}`)
    .join("\n");

  const subject =
    opts.scenarioTitles.length === 1
      ? `You've been assigned to test: ${opts.scenarioTitles[0].title}`
      : `You've been assigned ${opts.scenarioTitles.length} test scenarios`;

  const sections: { label: string; text: string }[] = [
    {
      label: opts.scenarioTitles.length === 1 ? "Scenario" : "Scenarios",
      text: scenarioList,
    },
    { label: "Your role", text: opts.persona },
  ];

  if (opts.adminNotes) {
    sections.push({ label: "Notes from admin", text: opts.adminNotes });
  }

  const html = emailTemplate({
    preheader: `${opts.adminName} assigned you a testing scenario`,
    greeting: `Hi ${opts.testerName},`,
    mainMessage: `${esc(opts.adminName)} has assigned you a testing scenario for SYNRGY E2E verification.`,
    sections,
    ctaText: "Start testing →",
    ctaUrl: `${APP_URL}/dashboard`,
    footer:
      "You'll be testing on the SYNRGY E2E Testing platform. Log in with this email address to get started.",
  });

  await sendEmail(opts.testerEmail, subject, html);
}

// ─── EMAIL 2: Tester completed all checkpoints for a scenario ────

export async function sendCompletionEmail(opts: {
  testerName: string;
  testerEmail: string;
  testerId: string;
  scenarioTitle: string;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  total: number;
  failedChecks: { id: string; text: string }[];
  assignerEmail?: string | null;
}) {
  const recipients: string[] = [];
  if (ADMIN_EMAIL) recipients.push(ADMIN_EMAIL);
  if (opts.assignerEmail && !recipients.includes(opts.assignerEmail)) {
    recipients.push(opts.assignerEmail);
  }
  if (recipients.length === 0) return;

  const summary = `${opts.passed} passed, ${opts.failed} failed, ${opts.blocked} blocked, ${opts.skipped} skipped out of ${opts.total} total checkpoints`;

  const sections: { label: string; text: string }[] = [
    { label: "Results summary", text: summary },
  ];

  if (opts.failedChecks.length > 0) {
    const MAX = 10;
    const shown = opts.failedChecks.slice(0, MAX);
    let failureText = shown.map((c) => `${c.id}: ${c.text}`).join("\n");
    if (opts.failedChecks.length > MAX) {
      failureText += `\n...and ${opts.failedChecks.length - MAX} more`;
    }
    sections.push({ label: "Failures", text: failureText });
  }

  const html = emailTemplate({
    preheader: `${opts.testerName} completed testing ${opts.scenarioTitle}`,
    greeting: "Hi,",
    mainMessage: `<strong>${esc(opts.testerName)}</strong> (${esc(opts.testerEmail)}) has finished testing all checkpoints in <strong>${esc(opts.scenarioTitle)}</strong>.`,
    sections,
    ctaText: "View full results →",
    ctaUrl: `${APP_URL}/admin/tester/${opts.testerId}`,
  });

  await sendEmail(
    recipients,
    `${opts.testerName} has completed testing: ${opts.scenarioTitle}`,
    html
  );
}

// ─── EMAIL 3: Retest requested ───────────────────────────────────

export async function sendRetestRequestedEmail(opts: {
  testerEmail: string;
  testerName: string;
  adminName: string;
  checkpointText: string;
  reason: string;
  whatToVerify: string;
  originalNotes?: string | null;
  scenarioId: string;
  stepIndex: number;
  checkId: string;
}) {
  const sections: { label: string; text: string }[] = [
    { label: "What was fixed", text: opts.reason },
    { label: "What to verify", text: opts.whatToVerify },
  ];

  if (opts.originalNotes) {
    sections.push({ label: "Your original report", text: opts.originalNotes });
  }

  sections.push({ label: "Checkpoint", text: opts.checkpointText });

  const html = emailTemplate({
    preheader: `${opts.adminName} requested a retest`,
    greeting: `Hi ${opts.testerName},`,
    mainMessage: `${esc(opts.adminName)} has requested that you re-verify a test checkpoint. A fix has been deployed.`,
    sections,
    ctaText: "Go to retest →",
    ctaUrl: `${APP_URL}/scenario/${opts.scenarioId}?step=${opts.stepIndex}&check=${opts.checkId}`,
    footer: "Please complete this retest at your earliest convenience.",
  });

  await sendEmail(
    opts.testerEmail,
    `Retest requested: ${opts.checkpointText.slice(0, 60)}`,
    html
  );
}

// ─── EMAIL 4: Retest completed ───────────────────────────────────

export async function sendRetestCompletedEmail(opts: {
  testerName: string;
  testerId: string;
  checkpointText: string;
  result: "pass" | "fail";
  retestNotes?: string | null;
  whatToVerify: string;
  adminEmail?: string | null;
}) {
  const recipients: string[] = [];
  if (ADMIN_EMAIL) recipients.push(ADMIN_EMAIL);
  if (opts.adminEmail && !recipients.includes(opts.adminEmail)) {
    recipients.push(opts.adminEmail);
  }
  if (recipients.length === 0) return;

  const isFixed = opts.result === "pass";
  const resultLabel = isFixed ? "VERIFIED FIXED" : "STILL FAILING";
  const resultColor = isFixed ? "#0F6E56" : "#A32D2D";
  const statusTag = `<span style="color: ${resultColor}; font-weight: 700; font-size: 14px;">${resultLabel}</span>`;

  const sections: { label: string; text: string }[] = [];

  if (opts.retestNotes) {
    sections.push({ label: "Tester's retest notes", text: opts.retestNotes });
  }

  sections.push({ label: "What was tested", text: opts.whatToVerify });

  if (!isFixed) {
    sections.push({
      label: "Recommendation",
      text: "The tester reports this issue is not resolved. Review their updated notes and screenshots in the admin dashboard.",
    });
  }

  const html = emailTemplate({
    preheader: `Retest ${isFixed ? "passed" : "failed"}: ${opts.checkpointText.slice(0, 40)}`,
    greeting: "Hi,",
    mainMessage: `<strong>${esc(opts.testerName)}</strong> has completed the retest for <strong>${esc(opts.checkpointText.slice(0, 80))}</strong>.<br><br>Result: ${statusTag}`,
    sections,
    ctaText: "View details →",
    ctaUrl: `${APP_URL}/admin/tester/${opts.testerId}`,
  });

  const subjectStatus = isFixed ? "FIXED" : "STILL FAILING";
  await sendEmail(
    recipients,
    `Retest result: ${opts.checkpointText.slice(0, 50)} — ${subjectStatus}`,
    html
  );
}
