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
      className="block rounded-2xl bg-surface-elevated border border-border p-4 hover:border-accent/40 transition-colors text-left no-underline"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className="text-xs text-pink-400/70 font-mono">#{dataset.id}</span>
        <span className="text-xs text-pink-400/70">{dataset.downloads} downloads</span>
      </div>
      <h3 className="font-semibold text-pink-50 truncate mb-1">{dataset.name}</h3>
      <p className="text-sm text-pink-300/80 line-clamp-2 mb-3">{dataset.description || "No description."}</p>
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <span className="text-xs text-pink-400/70">{dataset.size}</span>
        {dataset.price === 0 ? (
          <span className="text-xs font-medium text-green-400/90 bg-green-500/10 px-2 py-0.5 rounded">Free</span>
        ) : (
          <span className="text-sm font-semibold text-accent">{dataset.price} APT</span>
        )}
      </div>
    </Link>
  );
}
