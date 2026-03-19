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
        <main className="flex-1 max-w-xl mx-auto px-4 py-12 text-center">
          <p className="text-pink-400/80 mb-4">Connect your wallet to list a dataset.</p>
          <Link href="/marketplace" className="text-accent hover:underline">Back to Marketplace</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12">
        <div className="rounded-2xl bg-surface-elevated border border-border p-6">
          <h1 className="text-xl font-semibold text-pink-50 mb-4">List dataset</h1>

          {step === "done" && (
            <p className="text-accent mb-4">Dataset listed. Redirecting to marketplace…</p>
          )}

          {(step === "form" || step === "uploading" || step === "confirming") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-pink-400/80 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-pink-100"
                  placeholder="My dataset"
                />
              </div>
              <div>
                <label className="block text-sm text-pink-400/80 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-pink-100"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-sm text-pink-400/80 mb-1">Price (APT)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-pink-100"
                />
              </div>
              <div>
                <label className="block text-sm text-pink-400/80 mb-1">File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full text-sm text-pink-200 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-accent file:text-surface"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={step === "uploading" || step === "confirming"}
                  className="px-4 py-2 rounded-lg bg-accent text-surface font-medium hover:bg-accent-muted disabled:opacity-60"
                >
                  {step === "uploading" && "Uploading…"}
                  {step === "confirming" && "Confirm in wallet…"}
                  {step === "form" && "List dataset"}
                </button>
                <Link href="/marketplace" className="px-4 py-2 rounded-lg border border-border text-pink-200 hover:bg-surface-muted">
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
