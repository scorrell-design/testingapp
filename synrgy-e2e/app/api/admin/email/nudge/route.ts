import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sendNudgeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { error, tester } = await requireAdmin();
  if (error) return error;

  const { tester_ids } = await request.json();

  if (!tester_ids?.length) {
    return NextResponse.json({ error: "tester_ids required" }, { status: 400 });
  }

  const { data: testers } = await supabase
    .from("testers")
    .select("id, name, email")
    .in("id", tester_ids);

  let sent = 0;
  for (const t of testers ?? []) {
    const { count } = await supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("tester_id", t.id);

    if (count && count > 0) {
      await sendNudgeEmail({
        testerEmail: t.email,
        testerName: t.name,
        pendingScenarios: count,
        sentBy: tester!.id,
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
