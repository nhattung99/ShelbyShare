"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useCallback } from "react";

export function WalletConnect() {
  const { connect, disconnect, account, connected, wallets } = useWallet();
  const [open, setOpen] = useState(false);

  const handleConnect = useCallback(
    async (walletName: string) => {
      const w = wallets.find((x) => x.name === walletName);
      if (w) {
        await connect(w.name);
        setOpen(false);
      }
    },
    [connect, wallets]
  );

  if (connected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-[140px] truncate font-mono text-sm text-on-surface/80">
          {account.address.toString().slice(0, 6)}…
          {account.address.toString().slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-sm text-on-surface/90 transition-colors hover:border-secondary/50 hover:bg-surface-elevated"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
      >
        Connect wallet
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-surface-elevated py-2 shadow-xl">
            {wallets.length === 0 ? (
              <p className="px-4 py-2 text-sm text-on-surface/60">
                No wallets found. Install Petra or another Aptos wallet.
              </p>
            ) : (
              wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => handleConnect(wallet.name)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-muted"
                >
                  {wallet.name}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
