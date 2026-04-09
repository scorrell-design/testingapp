import { Resend } from "resend";
import { supabase } from "./supabase";
import { scenarios, getScenarioStats } from "./scenarios";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

const TEAL = "#005F78";
const BORDER = "#E5E7EB";
const GRAY_TEXT = "#6B7280";
const DARK_TEXT = "#2A2A2A";
const BOX_BG = "#FAFAFA";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailBox(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 0;color:${GRAY_TEXT};font-size:13px;width:120px;vertical-align:top;">${esc(r.label)}</td><td style="padding:4px 0;color:${DARK_TEXT};font-size:13px;">${esc(r.value)}</td></tr>`
    )
    .join("");
  return `<table style="width:100%;background:${BOX_BG};border:1px solid ${BORDER};border-radius:8px;padding:16px 20px;margin:16px 0;border-collapse:collapse;"><tbody>${rowsHtml}</tbody></table>`;
}

export function emailTemplate(content: {
  greeting: string;
  mainMessage: string;
  detailRows?: { label: string; value: string }[];
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const boxHtml = content.detailRows?.length ? detailBox(content.detailRows) : "";

  const ctaHtml =
    content.ctaText && content.ctaUrl
      ? `<div style="text-align:center;margin:24px 0 8px;"><a href="${content.ctaUrl}" style="display:inline-block;background:${TEAL};color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">${esc(content.ctaText)}</a></div>`
      : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <tr><td style="background:${TEAL};color:#ffffff;padding:14px 24px;border-radius:10px 10px 0 0;">
    <span style="font-size:15px;font-weight:600;">SYNRGY E2E Testing</span>
  </td></tr>
  <tr><td style="background:#ffffff;border:1px solid ${BORDER};border-top:0;padding:28px 24px;border-radius:0 0 10px 10px;">
    <p style="color:${DARK_TEXT};font-size:14px;margin:0 0 10px;line-height:1.5;">${esc(content.greeting)}</p>
    <p style="color:${DARK_TEXT};font-size:14px;margin:0 0 4px;line-height:1.5;">${content.mainMessage}</p>
    ${boxHtml}
    ${ctaHtml}
    <hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0 12px;">
    <p style="color:#9ca3af;font-size:11px;margin:0;text-align:center;">SYNRGY Health &mdash; Internal QA</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ─── Settings check ──────────────────────────────────────────────

const SETTING_KEYS: Record<string, string> = {
  assignment: "auto_assignment_email",
  completion: "auto_completion_email",
  retest_request: "auto_retest_request_email",
  retest_completed: "auto_retest_completed_email",
};

async function isEmailTypeEnabled(type: string): Promise<boolean> {
  const key = SETTING_KEYS[type];
  if (!key) return true;
  try {
    const { data, error } = await supabase
      .from("email_settings")
      .select("enabled")
      .eq("setting_key", key)
      .single();
    if (error) return true;
    return data?.enabled !== false;
  } catch {
    return true;
  }
}

// ─── Core send + log ─────────────────────────────────────────────

type EmailMeta = {
  type: string;
  toName?: string;
  testerId?: string;
  scenarioId?: string;
  checkId?: string;
  sentBy?: string;
  triggeredBy?: "automated" | "manual";
};

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  meta: EmailMeta
) {
  const triggeredBy = meta.triggeredBy || "automated";

  if (triggeredBy === "automated") {
    const enabled = await isEmailTypeEnabled(meta.type);
    if (!enabled) {
      console.log(`[email] ${meta.type} disabled, skipping:`, subject);
      return null;
    }
  }

  const recipients = Array.isArray(to) ? to : [to];
  let status = "sent";
  let errorMessage: string | null = null;

  if (!resend) {
    console.log("[email] Resend not configured, skipping:", subject);
    status = "failed";
    errorMessage = "RESEND_API_KEY not configured";
  } else {
    try {
      await resend.emails.send({ from: FROM_EMAIL, to: recipients, subject, html });
    } catch (error) {
      console.error("[email] Failed to send:", error);
      status = "failed";
      errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  try {
    const { data: logged } = await supabase
      .from("email_log")
      .insert({
        to_email: recipients.join(", "),
        to_name: meta.toName || null,
        subject,
        html,
        email_type: meta.type,
        status,
        error_message: errorMessage,
        related_tester_id: meta.testerId || null,
        related_scenario_id: meta.scenarioId || null,
        related_check_id: meta.checkId || null,
        sent_by: meta.sentBy || null,
        triggered_by: triggeredBy,
      })
      .select("id")
      .single();
    return logged;
  } catch {
    console.error("[email] Failed to log email to email_log table");
    return null;
  }
}

// ─── EMAIL 1: Tester assigned ────────────────────────────────────

export async function sendAssignmentEmail(opts: {
  testerEmail: string;
  testerName: string;
  adminName: string;
  scenarioTitles: { title: string; summary: string }[];
  persona: string;
  adminNotes?: string | null;
  sentBy?: string;
  triggeredBy?: "automated" | "manual";
}) {
  const first = opts.scenarioTitles[0];
  const scenario = scenarios.find((s) => s.title === first.title);
  const stats = scenario ? getScenarioStats(scenario) : null;

  const subject =
    opts.scenarioTitles.length === 1
      ? `You're assigned: ${first.title}`
      : `You're assigned ${opts.scenarioTitles.length} test scenarios`;

  const detailRows: { label: string; value: string }[] = [
    { label: "Scenario", value: opts.scenarioTitles.map((s) => s.title).join(", ") },
    { label: "Your role", value: opts.persona },
  ];

  if (stats) {
    detailRows.push({ label: "Platform", value: stats.platforms.join(", ") });
    detailRows.push({ label: "Est. time", value: `${stats.estimatedMinutes} minutes` });
    detailRows.push({ label: "Steps", value: `${stats.stepCount} steps, ${stats.totalCheckpoints} checkpoints` });
  }

  if (opts.adminNotes) {
    detailRows.push({ label: "Notes", value: opts.adminNotes });
  }

  const html = emailTemplate({
    greeting: `Hi ${opts.testerName},`,
    mainMessage: `You've been assigned to test "${esc(first.title)}" as the ${esc(opts.persona)} role.`,
    detailRows,
    ctaText: "Start Testing →",
    ctaUrl: `${APP_URL}/dashboard`,
  });

  return sendEmail(opts.testerEmail, subject, html, {
    type: "assignment",
    toName: opts.testerName,
    scenarioId: opts.scenarioTitles.map((s) => s.title).join(", "),
    sentBy: opts.sentBy,
    triggeredBy: opts.triggeredBy || "automated",
  });
}

// ─── EMAIL 2: Scenario complete (to admin) ───────────────────────

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
  sentBy?: string;
  triggeredBy?: "automated" | "manual";
}) {
  const recipients: string[] = [];
  if (ADMIN_EMAIL) recipients.push(ADMIN_EMAIL);
  if (opts.assignerEmail && !recipients.includes(opts.assignerEmail)) {
    recipients.push(opts.assignerEmail);
  }
  if (recipients.length === 0) return null;

  const subject = `Testing complete: ${opts.scenarioTitle} — ${opts.testerName}`;

  const html = emailTemplate({
    greeting: "Hi,",
    mainMessage: `<strong>${esc(opts.testerName)}</strong> has finished testing "${esc(opts.scenarioTitle)}".`,
    detailRows: [
      { label: "Passed", value: String(opts.passed) },
      { label: "Failed", value: String(opts.failed) },
      { label: "Blocked", value: String(opts.blocked) },
      { label: "Skipped", value: String(opts.skipped) },
      { label: "Total", value: String(opts.total) },
    ],
    ctaText: "View Full Results →",
    ctaUrl: `${APP_URL}/admin/tester/${opts.testerId}`,
  });

  return sendEmail(recipients, subject, html, {
    type: "completion",
    toName: opts.testerName,
    testerId: opts.testerId,
    scenarioId: opts.scenarioTitle,
    sentBy: opts.sentBy,
    triggeredBy: opts.triggeredBy || "automated",
  });
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
  sentBy?: string;
  triggeredBy?: "automated" | "manual";
}) {
  const scenario = scenarios.find((s) => s.id === opts.scenarioId);
  const step = scenario?.steps[opts.stepIndex];

  const subject = `Retest needed: ${opts.checkpointText.slice(0, 60)}`;

  const detailRows: { label: string; value: string }[] = [];
  if (scenario) detailRows.push({ label: "Scenario", value: scenario.title });
  if (step) detailRows.push({ label: "Step", value: step.title });
  detailRows.push({ label: "Checkpoint", value: opts.checkId });
  if (opts.originalNotes) detailRows.push({ label: "Your note", value: `"${opts.originalNotes}"` });
  detailRows.push({ label: "Est. time", value: "~5 minutes" });

  const html = emailTemplate({
    greeting: `Hi ${opts.testerName},`,
    mainMessage: "A fix is ready for a bug you reported. Please retest this specific item.",
    detailRows,
    ctaText: "Go to Retest →",
    ctaUrl: `${APP_URL}/scenario/${opts.scenarioId}?step=${opts.stepIndex}&check=${opts.checkId}&retest=true`,
  });

  return sendEmail(opts.testerEmail, subject, html, {
    type: "retest_request",
    toName: opts.testerName,
    scenarioId: opts.scenarioId,
    checkId: opts.checkId,
    sentBy: opts.sentBy,
    triggeredBy: opts.triggeredBy || "automated",
  });
}

// ─── EMAIL 4: Retest completed (to admin) ────────────────────────

export async function sendRetestCompletedEmail(opts: {
  testerName: string;
  testerId: string;
  checkpointText: string;
  result: "pass" | "fail";
  retestNotes?: string | null;
  whatToVerify: string;
  adminEmail?: string | null;
  sentBy?: string;
  triggeredBy?: "automated" | "manual";
}) {
  const recipients: string[] = [];
  if (ADMIN_EMAIL) recipients.push(ADMIN_EMAIL);
  if (opts.adminEmail && !recipients.includes(opts.adminEmail)) {
    recipients.push(opts.adminEmail);
  }
  if (recipients.length === 0) return null;

  const isFixed = opts.result === "pass";
  const resultLabel = isFixed ? "PASS ✓" : "FAIL ✗";

  const subject = `Retest result: ${isFixed ? "PASS" : "FAIL"} — ${opts.checkpointText.slice(0, 50)}`;

  const detailRows: { label: string; value: string }[] = [
    { label: "Checkpoint", value: opts.checkpointText.slice(0, 80) },
    { label: "Result", value: resultLabel },
  ];
  if (opts.retestNotes) detailRows.push({ label: "Notes", value: `"${opts.retestNotes}"` });

  const html = emailTemplate({
    greeting: "Hi,",
    mainMessage: `<strong>${esc(opts.testerName)}</strong> retested and marked it <strong>${resultLabel}</strong>.`,
    detailRows,
    ctaText: "View in Admin Dashboard →",
    ctaUrl: `${APP_URL}/admin/tester/${opts.testerId}`,
  });

  return sendEmail(recipients, subject, html, {
    type: "retest_completed",
    toName: opts.testerName,
    testerId: opts.testerId,
    sentBy: opts.sentBy,
    triggeredBy: opts.triggeredBy || "automated",
  });
}

// ─── Nudge / broadcast helpers ───────────────────────────────────

export async function sendNudgeEmail(opts: {
  testerEmail: string;
  testerName: string;
  pendingScenarios: number;
  sentBy?: string;
}) {
  const html = emailTemplate({
    greeting: `Hi ${opts.testerName},`,
    mainMessage: `Just a reminder — you have <strong>${opts.pendingScenarios}</strong> testing scenario${opts.pendingScenarios > 1 ? "s" : ""} waiting for you.`,
    ctaText: "Start Testing →",
    ctaUrl: `${APP_URL}/dashboard`,
  });

  return sendEmail(
    opts.testerEmail,
    `Reminder: ${opts.pendingScenarios} test scenario${opts.pendingScenarios > 1 ? "s" : ""} waiting`,
    html,
    { type: "manual", toName: opts.testerName, sentBy: opts.sentBy, triggeredBy: "manual" }
  );
}

export async function sendRetestNudgeEmail(opts: {
  testerEmail: string;
  testerName: string;
  pendingRetests: number;
  sentBy?: string;
}) {
  const html = emailTemplate({
    greeting: `Hi ${opts.testerName},`,
    mainMessage: `You have <strong>${opts.pendingRetests}</strong> retest${opts.pendingRetests > 1 ? "s" : ""} waiting. Fixes have been deployed and your admin is waiting on verification.`,
    ctaText: "View Retests →",
    ctaUrl: `${APP_URL}/retests`,
  });

  return sendEmail(
    opts.testerEmail,
    `Reminder: ${opts.pendingRetests} retest${opts.pendingRetests > 1 ? "s" : ""} awaiting verification`,
    html,
    { type: "manual", toName: opts.testerName, sentBy: opts.sentBy, triggeredBy: "manual" }
  );
}

export async function sendBroadcastEmail(opts: {
  testerEmail: string;
  testerName: string;
  subject: string;
  message: string;
  sentBy?: string;
}) {
  const html = emailTemplate({
    greeting: `Hi ${opts.testerName},`,
    mainMessage: esc(opts.message),
    ctaText: "Go to Dashboard →",
    ctaUrl: `${APP_URL}/dashboard`,
  });

  return sendEmail(opts.testerEmail, opts.subject, html, {
    type: "manual", toName: opts.testerName, sentBy: opts.sentBy, triggeredBy: "manual",
  });
}

export async function sendManualEmail(opts: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  sentBy?: string;
}) {
  return sendEmail(opts.to, opts.subject, opts.html, {
    type: "manual", toName: opts.toName, sentBy: opts.sentBy, triggeredBy: "manual",
  });
}
