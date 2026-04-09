import { NextResponse } from "next/server";
import { getCurrentTester } from "./auth";

export async function requireAdmin() {
  const tester = await getCurrentTester();
  if (!tester) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
      tester: null,
    };
  }
  if (tester.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
      tester: null,
    };
  }
  return { error: null, tester };
}

export async function requireAuth() {
  const tester = await getCurrentTester();
  if (!tester) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
      tester: null,
    };
  }
  return { error: null, tester };
}
