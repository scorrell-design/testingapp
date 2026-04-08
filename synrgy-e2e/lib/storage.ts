import { supabase } from "./supabase";

const BUCKET = "screenshots";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export type ScreenshotRecord = {
  id: string;
  file_url: string;
  file_name: string;
  created_at: string;
};

export async function uploadScreenshot(
  testerId: string,
  checkId: string,
  file: File
): Promise<ScreenshotRecord> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 5 MB limit");
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${testerId}/${checkId}/${timestamp}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const fileUrl = urlData.publicUrl;

  const { data, error } = await supabase
    .from("screenshots")
    .insert({
      tester_id: testerId,
      check_id: checkId,
      file_url: fileUrl,
      file_name: file.name,
    })
    .select("id, file_url, file_name, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as ScreenshotRecord;
}

export async function listScreenshots(
  testerId: string,
  checkId: string
): Promise<ScreenshotRecord[]> {
  const { data, error } = await supabase
    .from("screenshots")
    .select("id, file_url, file_name, created_at")
    .eq("tester_id", testerId)
    .eq("check_id", checkId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ScreenshotRecord[];
}

export async function deleteScreenshot(
  testerId: string,
  screenshotId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("screenshots")
    .select("file_url")
    .eq("id", screenshotId)
    .eq("tester_id", testerId)
    .single();

  if (error || !data) throw new Error("Screenshot not found");

  const url = new URL(data.file_url);
  const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET}/`);
  if (pathParts.length === 2) {
    await supabase.storage.from(BUCKET).remove([pathParts[1]]);
  }

  const { error: delError } = await supabase
    .from("screenshots")
    .delete()
    .eq("id", screenshotId)
    .eq("tester_id", testerId);

  if (delError) throw new Error(delError.message);
}
