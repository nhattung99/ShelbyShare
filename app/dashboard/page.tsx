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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-12 pt-24 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">
          Dashboard
        </h1>
        <p className="mb-10 text-on-surface/70">Files uploaded by your wallet.</p>

        {!account && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-10 text-center text-on-surface/60">
            Connect your wallet to see your files.
          </div>
        )}

        {account && isLoading && (
          <div className="py-12 text-center text-on-surface/60">
            Loading your files…
          </div>
        )}

        {account && error && (
          <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-on-surface/90">
            <p className="font-medium">Failed to load files</p>
            <p className="mt-1 text-sm text-on-surface/75">{error.message}</p>
            {/Unauthorized|API key not found/i.test(error.message) && (
              <p className="mt-3 text-sm text-on-surface/60">
                Trạng thái key:{" "}
                {process.env.NEXT_PUBLIC_SHELBY_API_KEY ? "✅ Đã có" : "❌ Chưa nhận"}. Geomi
                → client key → <strong>Approved URLs</strong> phải có:{" "}
                <code className="rounded bg-surface-muted px-1 text-on-surface/90">
                  {typeof window !== "undefined"
                    ? window.location.origin
                    : "http://localhost:3001"}
                </code>
                ,{" "}
                <code className="rounded bg-surface-muted px-1 text-on-surface/90">
                  http://localhost:3000
                </code>
                ,{" "}
                <code className="rounded bg-surface-muted px-1 text-on-surface/90">
                  http://localhost:3001
                </code>
                .
              </p>
            )}
          </div>
        )}

        {account && blobs && blobs.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-12 text-center text-on-surface/60">
            <p className="mb-4">No files yet.</p>
            <Link href="/" className="font-medium text-secondary hover:underline">
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
