import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sendRetestNudgeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { tester_ids } = await request.json();

  if (!tester_ids?.length) {
    return NextResponse.json({ error: "tester_ids required" }, { status: 400 });
  }

  let sent = 0;
  for (const tid of tester_ids) {
    const { data: t } = await supabase
      .from("testers")
      .select("id, name, email")
      .eq("id", tid)
      .single();

    if (!t) continue;

    const { count } = await supabase
      .from("retest_requests")
      .select("id", { count: "exact", head: true })
      .eq("tester_id", tid)
      .eq("status", "pending");

    if (count && count > 0) {
      await sendRetestNudgeEmail({
        testerEmail: t.email,
        testerName: t.name,
        pendingRetests: count,
        sentBy: tester!.id,
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
