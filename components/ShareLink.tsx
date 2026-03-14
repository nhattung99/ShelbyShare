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
      className={`flex items-center rounded-xl bg-surface-muted border border-border overflow-hidden ${className}`}
    >
      <input
        type="text"
        readOnly
        value={url}
        className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm text-zinc-300 font-mono truncate outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="px-4 py-2.5 bg-surface-elevated border-l border-border text-accent hover:bg-accent-dim text-sm font-medium transition-colors shrink-0"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
