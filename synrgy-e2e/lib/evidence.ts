import { supabase } from "./supabase";

const BUCKET = "test-evidence";

export async function uploadEvidence(
  testerId: string,
  checkId: string,
  file: File
): Promise<{
  id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
}> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${testerId}/${checkId}/${timestamp}_${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    const { error: fallbackError } = await supabase.storage
      .from("screenshots")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });
    if (fallbackError) throw new Error(fallbackError.message);
  }

  const { data, error } = await supabase
    .from("test_evidence")
    .insert({
      tester_id: testerId,
      check_id: checkId,
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    })
    .select("id, file_path, file_name, file_type, file_size")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSignedUrl(filePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600);

  if (data?.signedUrl) return data.signedUrl;

  const { data: fallback } = await supabase.storage
    .from("screenshots")
    .createSignedUrl(filePath, 3600);

  return fallback?.signedUrl ?? null;
}

export async function listEvidence(
  testerId: string,
  checkId: string
): Promise<Array<{
  id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  caption: string | null;
  created_at: string;
  url?: string;
}>> {
  const { data, error } = await supabase
    .from("test_evidence")
    .select("id, file_path, file_name, file_type, caption, created_at")
    .eq("tester_id", testerId)
    .eq("check_id", checkId)
    .order("created_at", { ascending: true });

  if (error) return [];

  const results = [];
  for (const item of data ?? []) {
    const url = await getSignedUrl(item.file_path);
    results.push({ ...item, url: url ?? undefined });
  }
  return results;
}

export async function deleteEvidence(testerId: string, evidenceId: string): Promise<void> {
  const { data } = await supabase
    .from("test_evidence")
    .select("file_path")
    .eq("id", evidenceId)
    .eq("tester_id", testerId)
    .single();

  if (data?.file_path) {
    await supabase.storage.from(BUCKET).remove([data.file_path]).catch(() => {});
  }

  await supabase
    .from("test_evidence")
    .delete()
    .eq("id", evidenceId)
    .eq("tester_id", testerId);
}
