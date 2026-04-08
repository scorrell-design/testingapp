import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie, getCurrentTester } from "@/lib/auth";
import {
  clearAllResultsOnSheet,
  getAllTesterResults,
  syncSummaryTab,
} from "@/lib/google-sheets";

export async function DELETE() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("test_results")
    .delete()
    .eq("tester_id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tester = await getCurrentTester();
  if (tester) {
    clearAllResultsOnSheet(tester.name)
      .then(() => getAllTesterResults())
      .then((all) => syncSummaryTab(all))
      .catch((err) => console.error("Sheets sync failed:", err));
  }

  return NextResponse.json({ ok: true });
}
