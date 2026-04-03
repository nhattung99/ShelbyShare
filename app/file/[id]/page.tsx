"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const useLocalMirror =
    typeof process.env.NEXT_PUBLIC_LOCAL_MIRROR !== "undefined" &&
    process.env.NEXT_PUBLIC_LOCAL_MIRROR === "1";
  const fileInfo = useMemo(() => getFileInfoFromShareId(id), [id]);

  const { data: metadata, isLoading, error } = useBlobMetadata({
    account: fileInfo?.account ?? "",
    name: fileInfo?.name ?? "",
  });

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    const name = fileInfo?.name ?? searchParams.get("name") ?? "file";
    setDownloadError(null);
    setDownloading(true);
    try {
      if (fileInfo) {
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
          return;
        } catch (primaryErr) {
          if (!useLocalMirror) throw primaryErr;
        }
      }
      // Fallback to local mirror if enabled
      const res = await fetch(
        `/api/local/mirror/${encodeURIComponent(id)}?name=${encodeURIComponent(name)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [fileInfo, id, useLocalMirror, searchParams]);

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

  const name =
    fileInfo?.name ?? searchParams.get("name") ?? "Unknown file";

  const mime = fileInfo ? getMimeFromName(fileInfo.name) : "";
  const canPreview =
    fileInfo &&
    (PREVIEW_TYPES.includes(mime) || mime.startsWith("image/") || mime.startsWith("text/"));

  if (!id || !fileInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col px-4 pb-12 pt-24 text-center">
          <h1 className="mb-2 text-xl font-semibold text-on-surface">Invalid link</h1>
          <p className="mb-4 text-on-surface/70">This share link is invalid or expired.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-secondary hover:underline"
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
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-24">
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm">
          <h1 className="mb-1 truncate text-xl font-semibold text-on-surface">
            {name}
          </h1>
          {(sizeStr || (metadata && "created_at" in metadata)) && (
            <p className="mb-4 text-sm text-on-surface/70">
              {sizeStr}
              {metadata && "created_at" in metadata && ` · ${new Date((metadata as { created_at: string }).created_at).toLocaleString()}`}
            </p>
          )}
          {isLoading && !metadata && (
            <p className="mb-4 text-sm text-on-surface/70">Loading file info…</p>
          )}
          {error && (
            <p className="mb-4 text-sm text-on-surface/60">
              Could not load metadata. You can still try to download.
            </p>
          )}

          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-lg bg-secondary px-4 py-2 font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-60"
            >
              {downloading ? "Downloading…" : "Download"}
            </button>
            {canPreview && (
              <button
                type="button"
                onClick={handlePreview}
                disabled={downloading}
                className="rounded-lg border border-border bg-surface-muted px-4 py-2 text-on-surface/85 transition-colors hover:border-secondary/50 hover:bg-surface disabled:opacity-60"
              >
                Preview
              </button>
            )}
          </div>

          {downloadError && (
            <p className="mb-4 text-sm text-red-500">{downloadError}</p>
          )}

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-sm text-on-surface/60">Share link</p>
            <ShareLink url={shareUrl} />
          </div>
        </div>

        {previewUrl && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
            <div className="flex justify-end border-b border-border p-2">
              <button
                type="button"
                onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                className="text-sm text-on-surface/60 hover:text-on-surface"
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
