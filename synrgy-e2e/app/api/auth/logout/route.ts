import { NextResponse } from "next/server";
import { clearTesterCookie } from "@/lib/auth";

export async function POST() {
  await clearTesterCookie();
  return NextResponse.json({ ok: true });
}
