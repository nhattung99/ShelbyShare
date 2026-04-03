"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { DatasetCard, type Dataset } from "@/components/marketplace/DatasetCard";
import { aptosClient } from "@/lib/aptosClient";
import { MODULE_ADDRESS } from "@/lib/constants";

function formatSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1073741824).toFixed(1)} GB`;
}

async function fetchDatasets(): Promise<Dataset[]> {
  const aptos = aptosClient();
  const [countRaw] = await aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_count`,
      typeArguments: [],
      functionArguments: [],
    },
  });
  const count = Number(countRaw);
  const results: Dataset[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const [addrRaw] = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_address`,
          typeArguments: [],
          functionArguments: [i],
        },
      });
      const datasetAddr = addrRaw as string;
      const resource = (await aptos.getAccountResource({
        accountAddress: datasetAddr,
        resourceType: `${MODULE_ADDRESS}::dataset_registry::DatasetInfo`,
      })) as {
        name: string;
        description: string;
        owner: string;
        size_bytes: string;
        price_octas: string;
        download_count: string;
        is_active: boolean;
      };

      if (!resource.is_active) continue;

      results.push({
        id: String(i + 1),
        datasetAddr,
        name: resource.name,
        description: resource.description,
        price: Number(resource.price_octas) / 1e8,
        tags: [],
        size: formatSize(Number(resource.size_bytes)),
        downloads: Number(resource.download_count),
        seller: resource.owner.slice(0, 8) + "…" + resource.owner.slice(-6),
      });
    } catch {
      // skip
    }
  }
  return results;
}

export default function MarketplacePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchDatasets()
      .then(setDatasets)
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return datasets;
    const q = query.toLowerCase();
    return datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.seller.toLowerCase().includes(q)
    );
  }, [query, datasets]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-12 pt-24 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-on-surface">Marketplace</h1>
          <p className="mx-auto max-w-xl text-on-surface/70">
            Buy and sell AI training datasets. On-chain ownership, Shelby storage.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/marketplace/upload"
              className="rounded-lg bg-secondary px-4 py-2 font-medium text-white hover:bg-secondary/90"
            >
              List dataset
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-border bg-white/70 px-4 py-2 font-medium text-on-surface/90 hover:bg-surface-muted"
            >
              Share file (free)
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or seller..."
            className="mx-auto block w-full max-w-md rounded-lg border border-border bg-surface px-3 py-2 text-on-surface placeholder-on-surface/40"
          />
        </div>

        {loading && (
          <div className="py-12 text-center text-on-surface/60">Loading datasets…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface-elevated p-12 text-center text-on-surface/60">
            No datasets yet. Be the first to list one.
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((d) => (
              <DatasetCard key={d.datasetAddr} dataset={d} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
