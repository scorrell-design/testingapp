import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTesterIdFromCookie, getCurrentTester } from "@/lib/auth";
import { syncCheckpointToSheet } from "@/lib/google-sheets";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const BUCKET = "screenshots";

export async function POST(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const checkId = formData.get("check_id") as string | null;

  if (!file || !checkId) {
    return NextResponse.json(
      { error: "file and check_id are required" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 5 MB limit" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${testerId}/${checkId}/${timestamp}_${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("screenshots")
    .insert({
      tester_id: testerId,
      check_id: checkId,
      file_url: urlData.publicUrl,
      file_name: file.name,
    })
    .select("id, file_url, file_name, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Append screenshot URL to the checkpoint's notes column in Google Sheets
  const tester = await getCurrentTester();
  if (tester) {
    const { data: result } = await supabase
      .from("test_results")
      .select("status, notes")
      .eq("tester_id", testerId)
      .eq("check_id", checkId)
      .single();

    if (result) {
      const notesWithScreenshot = [
        result.notes ?? "",
        `[Screenshot: ${urlData.publicUrl}]`,
      ]
        .filter(Boolean)
        .join("\n");

      syncCheckpointToSheet(tester.name, checkId, result.status, notesWithScreenshot)
        .catch((err) => console.error("Sheets screenshot sync failed:", err));
    }
  }

  return NextResponse.json(data);
}

export async function GET(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const checkId = searchParams.get("check_id");

  if (!checkId) {
    return NextResponse.json(
      { error: "check_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("screenshots")
    .select("id, file_url, file_name, created_at")
    .eq("tester_id", testerId)
    .eq("check_id", checkId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ screenshots: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const testerId = await getTesterIdFromCookie();
  if (!testerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data: screenshot } = await supabase
    .from("screenshots")
    .select("file_url")
    .eq("id", id)
    .eq("tester_id", testerId)
    .single();

  if (!screenshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const url = new URL(screenshot.file_url);
    const pathParts = url.pathname.split(
      `/storage/v1/object/public/${BUCKET}/`
    );
    if (pathParts.length === 2) {
      await supabase.storage.from(BUCKET).remove([pathParts[1]]);
    }
  } catch {
    // Storage deletion is best-effort
  }

  const { error } = await supabase
    .from("screenshots")
    .delete()
    .eq("id", id)
    .eq("tester_id", testerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
