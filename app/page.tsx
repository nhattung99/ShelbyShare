"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { UploadBox } from "@/components/UploadBox";
import { FileCard } from "@/components/FileCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { encodeShareId } from "@/lib/shelby";

export default function HomePage() {
  const { account } = useWallet();
  const [recentShareId, setRecentShareId] = useState<string | null>(null);
  const [recentName, setRecentName] = useState<string | null>(null);

  const { data: blobs, isLoading, error } = useAccountBlobs({
    account: account?.address?.toString() ?? "",
    pagination: { limit: 20, offset: 0 },
  });

  const onUploadComplete = useCallback((shareId: string, name: string) => {
    setRecentShareId(shareId);
    setRecentName(name);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Decentralized file sharing
          </h1>
          <p className="text-zinc-500">
            Upload to Shelby Protocol. Share a link. Anyone can download.
          </p>
        </div>

        <UploadBox onUploadComplete={onUploadComplete} />

        {recentShareId && recentName && (
          <div className="mt-8 p-4 rounded-xl bg-accent-dim border border-accent/30">
            <p className="text-sm text-zinc-400 mb-2">Just uploaded</p>
            <FileCard
              name={recentName}
              shareId={recentShareId}
              showShareLink
            />
          </div>
        )}

        {account && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-zinc-200 mb-4">
              Your files
            </h2>
            {isLoading && (
              <div className="text-zinc-500 py-8 text-center">
                Loading your files…
              </div>
            )}
            {error && (
              <div className="text-red-400 py-4 text-center">
                Failed to load files: {error.message}
              </div>
            )}
            {blobs && blobs.length === 0 && !isLoading && (
              <div className="text-zinc-500 py-8 text-center rounded-xl border border-border bg-surface-elevated">
                No files yet. Upload one above.
              </div>
            )}
            {blobs && blobs.length > 0 && (
              <div className="grid gap-3">
                {blobs.map((blob) => {
                  const shareId = encodeShareId(account.address.toString(), blob.name);
                  return (
                    <FileCard
                      key={`${account.address.toString()}-${blob.name}`}
                      name={blob.name}
                      shareId={shareId}
                      size={blob.size}
                      showShareLink
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
