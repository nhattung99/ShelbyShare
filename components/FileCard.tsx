"use client";

import Link from "next/link";
import { ShareLink } from "./ShareLink";

interface FileCardProps {
  name: string;
  shareId: string;
  size?: number;
  createdAt?: string;
  showShareLink?: boolean;
  /** AI-generated description (e.g. from upload) */
  description?: string;
  /** AI-generated tags, comma-separated */
  tags?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileCard({
  name,
  shareId,
  size,
  createdAt,
  showShareLink = true,
  description,
  tags,
}: FileCardProps) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/file/${shareId}` : `/file/${shareId}`;

  return (
    <div className="rounded-2xl bg-surface-elevated border border-border p-4 hover:border-accent/30 transition-colors shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/file/${shareId}`}
            className="font-medium text-pink-50 hover:text-accent truncate block"
          >
            {name}
          </Link>
          {(size != null || createdAt) && (
            <div className="mt-1 flex items-center gap-3 text-xs text-pink-400/80">
              {size != null && <span>{formatSize(size)}</span>}
              {createdAt && (
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
          {description && (
            <p className="mt-2 text-sm text-pink-200/90 line-clamp-2">{description}</p>
          )}
          {tags && (
            <p className="mt-1 text-xs text-pink-400/70">Tags: {tags}</p>
          )}
        </div>
      </div>
      {showShareLink && (
        <div className="mt-3">
          <ShareLink url={url} />
        </div>
      )}
    </div>
  );
}
