"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
  encodeFile,
  createRegisterBlobPayload,
  uploadBlobData,
  encodeShareId,
} from "@/lib/shelby";

export type AiDescribeResult = { description: string; tags: string };

type Status = "idle" | "encoding" | "registering" | "uploading" | "done" | "error";

async function describeFileWithAi(file: File): Promise<AiDescribeResult | null> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/ai/describe", { method: "POST", body: form });
  if (!res.ok) return null;
  const data = await res.json();
  return { description: data.description ?? "", tags: data.tags ?? "" };
}

export function UploadBox({
  onUploadComplete,
}: {
  onUploadComplete?: (shareId: string, name: string, ai?: AiDescribeResult) => void;
}) {
  const useLocalMirror =
    typeof process.env.NEXT_PUBLIC_LOCAL_MIRROR !== "undefined" &&
    process.env.NEXT_PUBLIC_LOCAL_MIRROR === "1";
  const { account, signAndSubmitTransaction } = useWallet();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [useAi, setUseAi] = useState(true);
  const [aiResult, setAiResult] = useState<AiDescribeResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [fromUrl, setFromUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!account?.address || !signAndSubmitTransaction) {
        setError("Connect your wallet first.");
        setStatus("error");
        return;
      }
      setError(null);
      setAiResult(null);
      setStatus("encoding");

      // Start AI describe in parallel (don't block upload)
      let aiPromise: Promise<AiDescribeResult | null> = Promise.resolve(null);
      if (useAi) {
        setAiLoading(true);
        aiPromise = describeFileWithAi(file).finally(() => setAiLoading(false));
      }

      try {
        const commitments = await encodeFile(file);
        setStatus("registering");
        const payload = createRegisterBlobPayload({
          accountAddress: account.address.toString(),
          blobName: file.name,
          commitments,
        });
        const { hash } = await signAndSubmitTransaction({ data: payload });
        const aptos = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: "https://api.shelbynet.shelby.xyz/v1",
            clientConfig: process.env.NEXT_PUBLIC_APTOS_API_KEY
              ? { API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY }
              : undefined,
          })
        );
        await aptos.waitForTransaction({ transactionHash: hash });
        setStatus("uploading");
        await uploadBlobData({
          accountAddress: account.address.toString(),
          blobName: file.name,
          blobData: new Uint8Array(await file.arrayBuffer()),
        });
        setStatus("done");
        const shareId = encodeShareId(account.address.toString(), file.name);
        // Optional: mirror to local filesystem for debugging
        if (useLocalMirror) {
          try {
            const form = new FormData();
            form.append("file", file);
            form.append("shareId", shareId);
            form.append("account", account.address.toString());
            form.append("blobName", file.name);
            await fetch("/api/local/mirror", {
              method: "POST",
              body: form,
            });
          } catch (mirrorErr) {
            // eslint-disable-next-line no-console
            console.warn("Local mirror failed:", mirrorErr);
          }
        }
        // Wait for AI if still in progress, then callback with result
        const ai = await aiPromise;
        setAiResult(ai ?? null);
        onUploadComplete?.(shareId, file.name, ai ?? undefined);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed";
        setError(message);
        setStatus("error");
      }
    },
    [account?.address, signAndSubmitTransaction, onUploadComplete, useAi, useLocalMirror]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer.files?.[0];
      if (file) upload(file);
    },
    [upload]
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);
  const onDragLeave = useCallback(() => setDrag(false), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = "";
    },
    [upload]
  );

  const busy = status === "encoding" || status === "registering" || status === "uploading";

  const uploadFromUrl = useCallback(async () => {
    const url = fromUrl.trim();
    if (!url || busy) return;
    setUrlError(null);
    setUrlLoading(true);
    try {
      const res = await fetch("/api/fetch-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const name = decodeURIComponent(res.headers.get("X-Filename") || "download");
      const file = new File([blob], name, { type: blob.type || "application/octet-stream" });
      setFromUrl("");
      await upload(file);
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : "Failed to fetch from URL");
    } finally {
      setUrlLoading(false);
    }
  }, [fromUrl, busy, upload]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {!account ? (
        <div className="rounded-2xl border border-border border-dashed bg-surface-muted/50 p-10 text-center text-on-surface/60">
          Connect your wallet to upload files.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="checkbox"
              id="use-ai"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              disabled={busy}
              className="rounded border-border bg-surface text-secondary focus:ring-secondary"
            />
            <label htmlFor="use-ai" className="cursor-pointer text-sm text-on-surface/80">
              Use AI to describe file
            </label>
          </div>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
              drag
                ? "border-secondary bg-accent-dim scale-[1.01]"
                : "border-border bg-surface-muted/50 hover:border-secondary/50"
            } ${busy ? "pointer-events-none opacity-80" : ""}`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={onInputChange}
              disabled={busy}
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              {status === "encoding" && (
                <p className="text-secondary">
                  Encoding file… {useAi && "(AI analyzing in background)"}
                </p>
              )}
              {status === "registering" && (
                <p className="text-secondary">Confirm in wallet…</p>
              )}
              {status === "uploading" && (
                <p className="text-secondary">Uploading to Shelby…</p>
              )}
              {status === "done" && (
                <div>
                  <p className="text-secondary">Upload complete.</p>
                  {aiLoading && (
                    <p className="mt-1 text-sm text-on-surface/60">AI describing…</p>
                  )}
                  {aiResult && !aiLoading && (
                    <div className="mx-auto mt-3 max-w-md rounded-lg border border-border bg-surface-elevated/80 p-3 text-left">
                      <p className="text-sm text-on-surface/90">{aiResult.description}</p>
                      {aiResult.tags && (
                        <p className="mt-1 text-xs text-on-surface/60">
                          Tags: {aiResult.tags}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {status === "error" && error && (
                <p className="text-red-400">{error}</p>
              )}
              {(status === "idle" || status === "done") && (
                <p className="text-on-surface/80">
                  Drop a file here or{" "}
                  <span className="underline text-secondary">browse</span>
                </p>
              )}
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface-muted/30 p-4">
            <p className="mb-2 text-sm text-on-surface/70">
              Upload trực tiếp từ nguồn (URL)
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="url"
                value={fromUrl}
                onChange={(e) => { setFromUrl(e.target.value); setUrlError(null); }}
                onKeyDown={(e) => e.key === "Enter" && uploadFromUrl()}
                placeholder="https://example.com/file.pdf"
                disabled={busy || urlLoading}
                className="min-w-[200px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-on-surface placeholder-on-surface/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={uploadFromUrl}
                disabled={busy || urlLoading || !fromUrl.trim()}
                className="rounded-lg bg-secondary px-4 py-2 font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
              >
                {urlLoading ? "Đang tải…" : "Tải & upload"}
              </button>
            </div>
            {urlError && (
              <p className="text-sm text-red-400 mt-2">{urlError}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
