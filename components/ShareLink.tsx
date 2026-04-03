"use client";

import { useState, useCallback } from "react";

interface ShareLinkProps {
  url: string;
  onCopy?: () => void;
  className?: string;
}

export function ShareLink({ url, onCopy, className = "" }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url, onCopy]);

  return (
    <div
      className={`flex items-center overflow-hidden rounded-xl border border-border bg-surface-muted ${className}`}
    >
      <input
        type="text"
        readOnly
        value={url}
        className="min-w-0 flex-1 truncate bg-transparent px-3 py-2.5 font-mono text-sm text-on-surface/90 outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 border-l border-border bg-surface-elevated px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-accent-dim"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
