"use client";

import { Header } from "@/components/Header";
import { FileCard } from "@/components/FileCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { encodeShareId } from "@/lib/shelby";
import Link from "next/link";

export default function DashboardPage() {
  const { account } = useWallet();
  const { data: blobs, isLoading, error } = useAccountBlobs({
    account: account?.address?.toString() ?? "",
    pagination: { limit: 100, offset: 0 },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-pink-50 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-pink-300/80 mb-10">
          Files uploaded by your wallet.
        </p>

        {!account && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-10 text-center text-pink-400/80">
            Connect your wallet to see your files.
          </div>
        )}

        {account && isLoading && (
          <div className="text-pink-400/80 py-12 text-center">
            Loading your files…
          </div>
        )}

        {account && error && (
          <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-pink-200">
            <p className="font-medium">Failed to load files</p>
            <p className="text-sm mt-1 text-pink-300/90">{error.message}</p>
            {/Unauthorized|API key not found/i.test(error.message) && (
              <p className="text-sm mt-3 text-pink-400/80">
                Trạng thái key: {process.env.NEXT_PUBLIC_SHELBY_API_KEY ? "✅ Đã có" : "❌ Chưa nhận"}. Geomi → client key → <strong>Approved URLs</strong> phải có: <code className="bg-surface-elevated px-1 rounded text-pink-200">{typeof window !== "undefined" ? window.location.origin : "http://localhost:3001"}</code>, <code className="bg-surface-elevated px-1 rounded text-pink-200">http://localhost:3000</code>, <code className="bg-surface-elevated px-1 rounded text-pink-200">http://localhost:3001</code>.
              </p>
            )}
          </div>
        )}

        {account && blobs && blobs.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-12 text-center text-pink-400/80">
            <p className="mb-4">No files yet.</p>
            <Link
              href="/"
              className="text-accent hover:underline font-medium"
            >
              Upload your first file →
            </Link>
          </div>
        )}

        {account && blobs && blobs.length > 0 && (
          <div className="grid gap-3">
            {blobs.map((blob) => (
              <FileCard
                key={`${account?.address?.toString() ?? ""}-${blob.name}`}
                name={blob.name}
                shareId={encodeShareId(account.address.toString(), blob.name)}
                size={blob.size}
                showShareLink
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
