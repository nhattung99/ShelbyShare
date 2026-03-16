"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { ShareLink } from "@/components/ShareLink";
import { getFileInfoFromShareId, downloadFile } from "@/lib/shelby";
import { useBlobMetadata } from "@shelby-protocol/react";

const PREVIEW_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "text/plain", "text/html", "application/pdf"];

function getMimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    txt: "text/plain",
    html: "text/html",
    pdf: "application/pdf",
  };
  return ext ? map[ext] ?? "application/octet-stream" : "application/octet-stream";
}

export default function FilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const fileInfo = useMemo(() => getFileInfoFromShareId(id), [id]);

  const { data: metadata, isLoading, error } = useBlobMetadata({
    account: fileInfo?.account ?? "",
    name: fileInfo?.name ?? "",
  });

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    if (!fileInfo) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      const data = await downloadFile(fileInfo.account, fileInfo.name);
      const mime = getMimeFromName(fileInfo.name);
      const blob = new Blob([new Uint8Array(data)], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInfo.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [fileInfo]);

  const handlePreview = useCallback(async () => {
    if (!fileInfo) return;
    setDownloadError(null);
    try {
      const data = await downloadFile(fileInfo.account, fileInfo.name);
      const mime = getMimeFromName(fileInfo.name);
      const blob = new Blob([new Uint8Array(data)], { type: mime });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Preview failed");
    }
  }, [fileInfo]);

  const mime = fileInfo ? getMimeFromName(fileInfo.name) : "";
  const canPreview = fileInfo && (PREVIEW_TYPES.includes(mime) || mime.startsWith("image/") || mime.startsWith("text/"));

  if (!id || !fileInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-semibold text-pink-50 mb-2">Invalid link</h1>
          <p className="text-pink-300/80 mb-4">This share link is invalid or expired.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-accent hover:underline"
          >
            Go home
          </button>
        </main>
      </div>
    );
  }

  const size = metadata?.size;
  const sizeStr = size != null
    ? size < 1024
      ? `${size} B`
      : size < 1024 * 1024
        ? `${(size / 1024).toFixed(1)} KB`
        : `${(size / (1024 * 1024)).toFixed(1)} MB`
    : null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/file/${id}` : `/file/${id}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
        <div className="rounded-2xl bg-surface-elevated border border-border p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-pink-50 truncate mb-1">
            {fileInfo.name}
          </h1>
          {(sizeStr || (metadata && "created_at" in metadata)) && (
            <p className="text-sm text-pink-300/80 mb-4">
              {sizeStr}
              {metadata && "created_at" in metadata && ` · ${new Date((metadata as { created_at: string }).created_at).toLocaleString()}`}
            </p>
          )}
          {isLoading && !metadata && (
            <p className="text-sm text-pink-300/80 mb-4">Loading file info…</p>
          )}
          {error && (
            <p className="text-sm text-pink-400 mb-4">Could not load metadata. You can still try to download.</p>
          )}

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded-lg bg-accent text-surface font-medium hover:bg-accent-muted disabled:opacity-60 transition-colors"
            >
              {downloading ? "Downloading…" : "Download"}
            </button>
            {canPreview && (
              <button
                type="button"
                onClick={handlePreview}
                disabled={downloading}
                className="px-4 py-2 rounded-lg bg-surface-muted border border-border text-pink-200 hover:bg-surface hover:border-accent/50 transition-colors disabled:opacity-60"
              >
                Preview
              </button>
            )}
          </div>

          {downloadError && (
            <p className="text-sm text-red-400 mb-4">{downloadError}</p>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-pink-400/80 mb-2">Share link</p>
            <ShareLink url={shareUrl} />
          </div>
        </div>

        {previewUrl && (
          <div className="mt-8 rounded-2xl border border-border bg-surface-elevated overflow-hidden shadow-sm">
            <div className="p-2 border-b border-border flex justify-end">
              <button
                type="button"
                onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                className="text-sm text-pink-400 hover:text-pink-100"
              >
                Close preview
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              {mime.startsWith("image/") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={fileInfo.name} className="max-w-full h-auto" />
              )}
              {mime === "text/plain" && (
                <iframe src={previewUrl} title="Preview" className="w-full h-96 border-0 bg-surface" />
              )}
              {mime === "application/pdf" && (
                <iframe src={previewUrl} title="PDF" className="w-full h-[70vh] border-0" />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
