"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { UploadBox } from "@/components/UploadBox";
import { FileCard } from "@/components/FileCard";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { FloatingCard } from "@/components/landing/FloatingCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { encodeShareId } from "@/lib/shelby";

export default function HomePage() {
  const { account } = useWallet();
  const [recentShareId, setRecentShareId] = useState<string | null>(null);
  const [recentName, setRecentName] = useState<string | null>(null);
  const [recentAi, setRecentAi] = useState<{
    description: string;
    tags: string;
  } | null>(null);

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
    <div className="relative flex min-h-screen flex-col font-sans">
      <LandingBackground />
      <Header />
      <main className="relative flex flex-1 flex-col pt-20 md:pt-24">
        <Hero />
        <FeatureGrid />

        <section className="mx-auto w-full max-w-7xl px-8 pb-16">
          <div className="mb-10 mt-4 text-center">
            <p className="text-on-surface/70">
              Upload to Shelby Protocol. Share a link. Anyone can download.
            </p>
            <p className="mt-2 text-sm text-on-surface/60">
              Or{" "}
              <Link href="/marketplace" className="font-medium text-secondary hover:underline">
                browse &amp; sell datasets
              </Link>{" "}
              on the Marketplace.
            </p>
          </div>

          <div className="mb-10 grid gap-3 text-sm sm:grid-cols-5">
            <div className="rounded-2xl border border-primary/15 bg-white/80 px-3 py-3 text-left sm:px-4 sm:py-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface/55">
                Step 1
              </p>
              <p className="mb-1 font-semibold text-on-surface">Connect</p>
              <p className="text-xs text-on-surface/70">
                Link your Aptos wallet to own and control your storage space.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-white/80 px-3 py-3 text-left sm:px-4 sm:py-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface/55">
                Step 2
              </p>
              <p className="mb-1 font-semibold text-on-surface">Upload</p>
              <p className="text-xs text-on-surface/70">
                Drop a local file or paste a source URL, then confirm on-chain.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-white/80 px-3 py-3 text-left sm:px-4 sm:py-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface/55">
                Step 3
              </p>
              <p className="mb-1 font-semibold text-on-surface">Catalog</p>
              <p className="text-xs text-on-surface/70">
                Every file appears in your on-chain catalog under “Your files”.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-white/80 px-3 py-3 text-left sm:px-4 sm:py-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface/55">
                Step 4
              </p>
              <p className="mb-1 font-semibold text-on-surface">AI process</p>
              <p className="text-xs text-on-surface/70">
                Optional AI descriptions and tags help you understand and search
                files.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-white/80 px-3 py-3 text-left sm:px-4 sm:py-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface/55">
                Step 5
              </p>
              <p className="mb-1 font-semibold text-on-surface">Download</p>
              <p className="text-xs text-on-surface/70">
                Share a short link so anyone can securely preview or download.
              </p>
            </div>
          </div>

          <div id="upload" className="scroll-mt-28">
            <h2 className="mb-6 text-center text-2xl font-bold text-on-surface">
              Upload
            </h2>
            <UploadBox onUploadComplete={onUploadComplete} />
          </div>

          {recentShareId && recentName && (
            <div className="mt-10 rounded-2xl border border-secondary/30 bg-accent-dim/90 p-5 shadow-lg shadow-primary/10">
              <p className="mb-3 text-sm font-medium text-on-surface/70">
                Just uploaded
              </p>
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
              <h2 className="mb-4 text-lg font-semibold text-on-surface">
                Your files
              </h2>
              {isLoading && (
                <div className="py-8 text-center text-on-surface/60">
                  Loading your files…
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-center text-on-surface/90">
                  <p className="font-medium">Failed to load files</p>
                  <p className="mt-1 text-sm text-on-surface/75">
                    {error.message}
                  </p>
                  {/Unauthorized|API key not found/i.test(error.message) && (
                    <p className="mt-3 text-sm text-on-surface/60">
                      Trạng thái key:{" "}
                      {process.env.NEXT_PUBLIC_SHELBY_API_KEY
                        ? "✅ Đã có trong app"
                        : "❌ App chưa nhận (cần restart dev server)"}
                      . Vào{" "}
                      <a
                        href="https://geomi.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-secondary hover:underline"
                      >
                        geomi.dev
                      </a>{" "}
                      → API Resource → client key →{" "}
                      <strong>Approved URLs</strong> phải có đúng URL bạn đang mở
                      (ví dụ{" "}
                      <code className="rounded bg-surface-muted px-1 text-on-surface/90">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3001"}
                      </code>
                      ). Thêm cả{" "}
                      <code className="rounded bg-surface-muted px-1 text-on-surface/90">
                        http://localhost:3000
                      </code>{" "}
                      và{" "}
                      <code className="rounded bg-surface-muted px-1 text-on-surface/90">
                        http://localhost:3001
                      </code>{" "}
                      rồi lưu.
                    </p>
                  )}
                </div>
              )}
              {blobs && blobs.length === 0 && !isLoading && (
                <div className="rounded-xl border border-border bg-surface-elevated py-8 text-center text-on-surface/60">
                  No files yet. Upload one above.
                </div>
              )}
              {blobs && blobs.length > 0 && (
                <div className="grid gap-3">
                  {blobs.map((blob) => {
                    const shareId = encodeShareId(
                      account.address.toString(),
                      blob.name
                    );
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
        </section>
      </main>
      <FloatingCard />
    </div>
  );
}
