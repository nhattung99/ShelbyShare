"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
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
  const [recentAi, setRecentAi] = useState<{ description: string; tags: string } | null>(null);

  const { data: blobs, isLoading, error } = useAccountBlobs({
    account: account?.address?.toString() ?? "",
    pagination: { limit: 20, offset: 0 },
  });

  const onUploadComplete = useCallback(
    (shareId: string, name: string, ai?: { description: string; tags: string }) => {
      setRecentShareId(shareId);
      setRecentName(name);
      setRecentAi(ai ?? null);
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-pink-50 mb-3 tracking-tight">
            Decentralized file sharing
          </h1>
          <p className="text-pink-300/80 text-lg max-w-xl mx-auto">
            Upload to Shelby Protocol. Share a link. Anyone can download.
          </p>
          <p className="mt-2 text-sm text-pink-400/80">
            Or <Link href="/marketplace" className="text-accent hover:underline">browse & sell datasets</Link> on the Marketplace.
          </p>
        </div>

        <section className="mb-10 grid gap-3 sm:grid-cols-5 text-sm">
          <div className="rounded-2xl bg-surface-elevated border border-border/70 px-3 py-3 sm:px-4 sm:py-4 text-left">
            <p className="text-[11px] uppercase tracking-[0.15em] text-pink-400/80 mb-1">
              Step 1
            </p>
            <p className="font-semibold text-pink-50 mb-1">Connect</p>
            <p className="text-xs text-pink-300/80">
              Link your Aptos wallet to own and control your storage space.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-elevated border border-border/70 px-3 py-3 sm:px-4 sm:py-4 text-left">
            <p className="text-[11px] uppercase tracking-[0.15em] text-pink-400/80 mb-1">
              Step 2
            </p>
            <p className="font-semibold text-pink-50 mb-1">Upload</p>
            <p className="text-xs text-pink-300/80">
              Drop a local file or paste a source URL, then confirm on-chain.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-elevated border border-border/70 px-3 py-3 sm:px-4 sm:py-4 text-left">
            <p className="text-[11px] uppercase tracking-[0.15em] text-pink-400/80 mb-1">
              Step 3
            </p>
            <p className="font-semibold text-pink-50 mb-1">Catalog</p>
            <p className="text-xs text-pink-300/80">
              Every file appears in your on-chain catalog under “Your files”.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-elevated border border-border/70 px-3 py-3 sm:px-4 sm:py-4 text-left">
            <p className="text-[11px] uppercase tracking-[0.15em] text-pink-400/80 mb-1">
              Step 4
            </p>
            <p className="font-semibold text-pink-50 mb-1">AI process</p>
            <p className="text-xs text-pink-300/80">
              Optional AI descriptions and tags help you understand and search files.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-elevated border border-border/70 px-3 py-3 sm:px-4 sm:py-4 text-left">
            <p className="text-[11px] uppercase tracking-[0.15em] text-pink-400/80 mb-1">
              Step 5
            </p>
            <p className="font-semibold text-pink-50 mb-1">Download</p>
            <p className="text-xs text-pink-300/80">
              Share a short link so anyone can securely preview or download.
            </p>
          </div>
        </section>

        <UploadBox onUploadComplete={onUploadComplete} />

        {recentShareId && recentName && (
          <div className="mt-10 p-5 rounded-2xl bg-accent-dim/80 border border-accent/30 shadow-lg shadow-accent/5">
            <p className="text-sm font-medium text-pink-400 mb-3">Just uploaded</p>
            <FileCard
              name={recentName}
              shareId={recentShareId}
              showShareLink
              description={recentAi?.description}
              tags={recentAi?.tags}
            />
          </div>
        )}

        {account && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold text-pink-100 mb-4">
              Your files
            </h2>
            {isLoading && (
              <div className="text-pink-400/80 py-8 text-center">
                Loading your files…
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-pink-200 text-center">
                <p className="font-medium">Failed to load files</p>
                <p className="text-sm mt-1 text-pink-300/90">{error.message}</p>
                {/Unauthorized|API key not found/i.test(error.message) && (
                  <p className="text-sm mt-3 text-pink-400/80">
                    Trạng thái key: {process.env.NEXT_PUBLIC_SHELBY_API_KEY ? "✅ Đã có trong app" : "❌ App chưa nhận (cần restart dev server)"}.{" "}
                    Vào <a href="https://geomi.dev" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">geomi.dev</a> → API Resource → client key → <strong>Approved URLs</strong> phải có đúng URL bạn đang mở (ví dụ <code className="bg-surface-elevated px-1 rounded text-pink-200">{typeof window !== "undefined" ? window.location.origin : "http://localhost:3001"}</code>). Thêm cả <code className="bg-surface-elevated px-1 rounded text-pink-200">http://localhost:3000</code> và <code className="bg-surface-elevated px-1 rounded text-pink-200">http://localhost:3001</code> rồi lưu.
                  </p>
                )}
              </div>
            )}
            {blobs && blobs.length === 0 && !isLoading && (
              <div className="text-pink-400/80 py-8 text-center rounded-xl border border-border bg-surface-elevated">
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
