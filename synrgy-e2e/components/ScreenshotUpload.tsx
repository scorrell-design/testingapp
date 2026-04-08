"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Screenshot = {
  id: string;
  file_url: string;
  file_name: string;
  created_at: string;
};

export default function ScreenshotUpload({ checkId }: { checkId: string }) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadScreenshots = useCallback(async () => {
    try {
      const res = await fetch(`/api/screenshots?check_id=${encodeURIComponent(checkId)}`);
      if (res.ok) {
        const data = await res.json();
        setScreenshots(data.screenshots ?? []);
      }
    } catch {
      // silent
    }
  }, [checkId]);

  useEffect(() => {
    loadScreenshots();
  }, [loadScreenshots]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5 MB limit");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("check_id", checkId);

      const res = await fetch("/api/screenshots", { method: "POST", body: form });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }

      await loadScreenshots();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this screenshot?")) return;

    try {
      await fetch(`/api/screenshots?id=${id}`, { method: "DELETE" });
      setScreenshots((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silent
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          {uploading ? "Uploading…" : "Screenshot"}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {error && <span className="text-xs text-status-fail">{error}</span>}
      </div>

      {screenshots.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {screenshots.map((s) => (
            <div key={s.id} className="group relative">
              <button
                onClick={() => setLightbox(s.file_url)}
                className="block h-[80px] overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                title={s.file_name}
              >
                <img
                  src={s.file_url}
                  alt={s.file_name}
                  className="h-full w-auto object-cover"
                />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white group-hover:flex"
                title="Delete"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox}
              alt="Screenshot"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
