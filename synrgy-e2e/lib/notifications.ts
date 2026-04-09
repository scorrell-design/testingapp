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
