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

type Status = "idle" | "encoding" | "registering" | "uploading" | "done" | "error";

export function UploadBox({
  onUploadComplete,
}: {
  onUploadComplete?: (shareId: string, name: string) => void;
}) {
  const { account, signAndSubmitTransaction } = useWallet();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!account?.address || !signAndSubmitTransaction) {
        setError("Connect your wallet first.");
        setStatus("error");
        return;
      }
      setError(null);
      setStatus("encoding");
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
            network: (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) ?? Network.TESTNET,
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
        onUploadComplete?.(shareId, file.name);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed";
        setError(message);
        setStatus("error");
      }
    },
    [account?.address, signAndSubmitTransaction, onUploadComplete]
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

  return (
    <div className="w-full max-w-xl mx-auto">
      {!account ? (
        <div className="rounded-xl border border-border border-dashed bg-surface-muted/50 p-8 text-center text-zinc-500">
          Connect your wallet to upload files.
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            drag
              ? "border-accent bg-accent-dim"
              : "border-border bg-surface-muted/50 hover:border-zinc-500"
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
              <p className="text-accent">Encoding file…</p>
            )}
            {status === "registering" && (
              <p className="text-accent">Confirm in wallet…</p>
            )}
            {status === "uploading" && (
              <p className="text-accent">Uploading to Shelby…</p>
            )}
            {status === "done" && (
              <p className="text-accent">Upload complete.</p>
            )}
            {status === "error" && error && (
              <p className="text-red-400">{error}</p>
            )}
            {(status === "idle" || status === "done") && (
              <p className="text-zinc-400">
                Drop a file here or <span className="text-accent underline">browse</span>
              </p>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
