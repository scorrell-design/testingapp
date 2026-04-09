import { NextResponse } from "next/server";
import { getCurrentTester } from "@/lib/auth";

export async function GET() {
  const tester = await getCurrentTester();

  if (!tester) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    tester: {
      id: tester.id,
      name: tester.name,
      email: tester.email,
      role: tester.role ?? "tester",
    },
  });
}
