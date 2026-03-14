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
        <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mb-10">
          Files uploaded by your wallet.
        </p>

        {!account && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-10 text-center text-zinc-500">
            Connect your wallet to see your files.
          </div>
        )}

        {account && isLoading && (
          <div className="text-zinc-500 py-12 text-center">
            Loading your files…
          </div>
        )}

        {account && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            Failed to load files: {error.message}
          </div>
        )}

        {account && blobs && blobs.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-12 text-center text-zinc-500">
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
