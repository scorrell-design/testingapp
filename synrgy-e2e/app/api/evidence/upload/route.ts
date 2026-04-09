import { NextRequest, NextResponse } from "next/server";
import { getTesterIdFromCookie } from "@/lib/auth";
import { uploadEvidence, getSignedUrl } from "@/lib/evidence";

export async function POST(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const checkId = formData.get("check_id") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !checkId) {
    return NextResponse.json(
      { error: "file and check_id are required" },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File exceeds 10 MB limit" },
      { status: 400 }
    );
  }

  try {
    const evidence = await uploadEvidence(testerId, checkId, file);
    const url = await getSignedUrl(evidence.file_path);

    return NextResponse.json({
      evidence: { ...evidence, url, caption },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
