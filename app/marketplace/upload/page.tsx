"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Header } from "@/components/Header";
import { MODULE_ADDRESS } from "@/lib/constants";

export default function MarketplaceUploadPage() {
  const router = useRouter();
  const { account, signAndSubmitTransaction } = useWallet();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "uploading" | "confirming" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !file) {
      setError("Connect wallet and select a file.");
      return;
    }
    setError(null);
    setStep("uploading");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sellerAddress", account.address.toString());

      const uploadRes = await fetch("/api/datasets/upload", { method: "POST", body: form });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        const msg = err.details ? `${err.error}: ${err.details}` : (err.error ?? "Upload failed");
        throw new Error(msg);
      }
      const { shelbyBlobName, commitmentBytes, blobSize } = await uploadRes.json();

      setStep("confirming");
      const priceOctas = Math.round(parseFloat(price || "0") * 1e8);
      const tags: string[] = [];
      const license = "CC-BY-4.0";

      await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::dataset_registry::register_dataset`,
          typeArguments: [],
          functionArguments: [
            name.trim(),
            description.trim(),
            shelbyBlobName,
            commitmentBytes,
            blobSize,
            priceOctas,
            tags,
            license,
          ],
        },
      });

      setStep("done");
      setTimeout(() => router.push("/marketplace"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStep("form");
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto flex max-w-xl flex-1 flex-col px-4 pb-12 pt-24 text-center">
          <p className="mb-4 text-on-surface/60">Connect your wallet to list a dataset.</p>
          <Link href="/marketplace" className="text-secondary hover:underline">Back to Marketplace</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-12 pt-24">
        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <h1 className="mb-4 text-xl font-semibold text-on-surface">List dataset</h1>

          {step === "done" && (
            <p className="mb-4 text-secondary">Dataset listed. Redirecting to marketplace…</p>
          )}

          {(step === "form" || step === "uploading" || step === "confirming") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-on-surface/60">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-on-surface"
                  placeholder="My dataset"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-on-surface/60">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-on-surface"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-on-surface/60">Price (APT)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-on-surface"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-on-surface/60">File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full text-sm text-on-surface/80 file:mr-2 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-white"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={step === "uploading" || step === "confirming"}
                  className="rounded-lg bg-secondary px-4 py-2 font-medium text-white hover:bg-secondary/90 disabled:opacity-60"
                >
                  {step === "uploading" && "Uploading…"}
                  {step === "confirming" && "Confirm in wallet…"}
                  {step === "form" && "List dataset"}
                </button>
                <Link href="/marketplace" className="rounded-lg border border-border px-4 py-2 text-on-surface/85 hover:bg-surface-muted">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
