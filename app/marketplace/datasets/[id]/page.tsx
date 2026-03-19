"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Header } from "@/components/Header";
import { aptosClient } from "@/lib/aptosClient";
import { MODULE_ADDRESS } from "@/lib/constants";

type DatasetInfo = {
  datasetAddr: string;
  name: string;
  owner: string;
  sizeBytes: number;
  price: number;
  downloads: number;
  isActive: boolean;
};

function formatSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

const SIGN_MESSAGE_TEXT = "Shelby AI DataVault download auth";

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { account, signAndSubmitTransaction, signMessage } = useWallet();
  const datasetAddr = typeof id === "string" ? id : "";

  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetAddr) return;
    setLoading(true);
    const aptos = aptosClient();
    aptos
      .view({
        payload: {
          function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_info`,
          typeArguments: [],
          functionArguments: [datasetAddr],
        },
      })
      .then((res: unknown) => {
        const arr = res as [unknown, string, string, unknown, string, string, string, boolean];
        const [, owner, name, , sizeRaw, priceRaw, dlRaw, isActive] = arr;
        setDataset({
          datasetAddr,
          name: name as string,
          owner: owner as string,
          sizeBytes: Number(sizeRaw),
          price: Number(priceRaw) / 1e8,
          downloads: Number(dlRaw),
          isActive: isActive as boolean,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [datasetAddr]);

  useEffect(() => {
    if (!account || !dataset) return;
    const walletAddr = account.address.toString();
    if (dataset.owner.toLowerCase() === walletAddr.toLowerCase()) {
      setHasAccess(true);
      return;
    }
    const aptos = aptosClient();
    aptos
      .view({
        payload: {
          function: `${MODULE_ADDRESS}::marketplace::has_access`,
          typeArguments: [],
          functionArguments: [walletAddr, datasetAddr],
        },
      })
      .then(([result]: unknown[]) => {
        if (result) setHasAccess(true);
      })
      .catch(() => {});
  }, [account, dataset, datasetAddr]);

  const handlePurchase = async () => {
    if (!account) {
      setError("Connect your wallet to purchase.");
      return;
    }
    setError(null);
    setPurchasing(true);
    try {
      const { hash } = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::marketplace::purchase_dataset`,
          typeArguments: [],
          functionArguments: [datasetAddr],
        },
      });
      await aptosClient().waitForTransaction({ transactionHash: hash });
      setHasAccess(true);
      await handleDownload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!account || !signMessage) {
      setError("Connect your wallet to download.");
      return;
    }
    setDownloading(true);
    setError(null);
    try {
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();
      const signed = await signMessage({ message: SIGN_MESSAGE_TEXT, nonce });
      const res = await fetch(`/api/datasets/${datasetAddr}/download`, {
        headers: {
          "x-buyer-address": account.address.toString(),
          "x-nonce": nonce,
          "x-signature": signed.signature?.toString() ?? "",
          "x-public-key": account.publicKey?.toString() ?? "",
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (dataset?.name ?? "dataset").replace(/[^a-zA-Z0-9._-]/g, "_");
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-pink-400/80">
          Loading dataset…
        </main>
      </div>
    );
  }

  if (notFound || !dataset) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-semibold text-pink-50 mb-2">Dataset not found</h1>
          <Link href="/marketplace" className="text-accent hover:underline">
            Back to Marketplace
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
        <div className="rounded-2xl bg-surface-elevated border border-border p-6">
          <h1 className="text-xl font-semibold text-pink-50 mb-2">{dataset.name}</h1>
          <p className="text-sm text-pink-300/80 mb-4">
            {formatSize(dataset.sizeBytes)} · {dataset.downloads} downloads · {dataset.price === 0 ? "Free" : `${dataset.price} APT`}
          </p>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          <div className="flex flex-wrap gap-3">
            {hasAccess ? (
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 rounded-lg bg-accent text-surface font-medium hover:bg-accent-muted disabled:opacity-60"
              >
                {downloading ? "Downloading…" : "Download"}
              </button>
            ) : dataset.price === 0 ? (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchasing}
                className="px-4 py-2 rounded-lg bg-accent text-surface font-medium hover:bg-accent-muted disabled:opacity-60"
              >
                {purchasing ? "Claiming…" : "Claim (free)"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchasing}
                className="px-4 py-2 rounded-lg bg-accent text-surface font-medium hover:bg-accent-muted disabled:opacity-60"
              >
                {purchasing ? "Purchasing…" : `Purchase ${dataset.price} APT`}
              </button>
            )}
            <Link
              href="/marketplace"
              className="px-4 py-2 rounded-lg border border-border text-pink-200 hover:bg-surface-muted"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
