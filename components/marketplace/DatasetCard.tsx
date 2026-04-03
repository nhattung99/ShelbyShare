"use client";

import Link from "next/link";

export interface Dataset {
  id: string;
  datasetAddr: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  size: string;
  downloads: number;
  seller: string;
}

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Link
      href={`/marketplace/datasets/${dataset.datasetAddr}`}
      className="block rounded-2xl border border-border bg-surface-elevated p-4 text-left no-underline transition-colors hover:border-secondary/40"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-on-surface/55">#{dataset.id}</span>
        <span className="text-xs text-on-surface/55">{dataset.downloads} downloads</span>
      </div>
      <h3 className="mb-1 truncate font-semibold text-on-surface">{dataset.name}</h3>
      <p className="mb-3 line-clamp-2 text-sm text-on-surface/70">
        {dataset.description || "No description."}
      </p>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs text-on-surface/55">{dataset.size}</span>
        {dataset.price === 0 ? (
          <span className="rounded bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700">
            Free
          </span>
        ) : (
          <span className="text-sm font-semibold text-secondary">{dataset.price} APT</span>
        )}
      </div>
    </Link>
  );
}
