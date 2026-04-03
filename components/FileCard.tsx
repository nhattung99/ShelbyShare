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
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/file/${shareId}`
      : `/file/${shareId}`;

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm transition-colors hover:border-secondary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/file/${shareId}`}
            className="block truncate font-medium text-on-surface hover:text-secondary"
          >
            {name}
          </Link>
          {(size != null || createdAt) && (
            <div className="mt-1 flex items-center gap-3 text-xs text-on-surface/60">
              {size != null && <span>{formatSize(size)}</span>}
              {createdAt && (
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm text-on-surface/80">
              {description}
            </p>
          )}
          {tags && (
            <p className="mt-1 text-xs text-on-surface/55">Tags: {tags}</p>
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
