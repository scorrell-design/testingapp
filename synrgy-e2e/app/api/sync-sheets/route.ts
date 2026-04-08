import { NextResponse } from "next/server";
import { getTesterIdFromCookie } from "@/lib/auth";
import { fullSyncAllSheets } from "@/lib/google-sheets";

export async function POST() {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await fullSyncAllSheets();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Full sheet sync failed:", err);
    return NextResponse.json(
      { error: "Sync failed — check server logs" },
      { status: 500 }
    );
  }
}
