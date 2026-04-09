import { NextRequest, NextResponse } from "next/server";
import { getTesterIdFromCookie } from "@/lib/auth";
import { listEvidence, deleteEvidence } from "@/lib/evidence";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ checkId: string }> }
) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { checkId } = await params;
  const evidence = await listEvidence(testerId, checkId);

  return NextResponse.json({ evidence });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ checkId: string }> }
) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const evidenceId = searchParams.get("evidence_id");

  if (!evidenceId) {
    return NextResponse.json({ error: "evidence_id is required" }, { status: 400 });
  }

  await deleteEvidence(testerId, evidenceId);
  return NextResponse.json({ ok: true });
}
