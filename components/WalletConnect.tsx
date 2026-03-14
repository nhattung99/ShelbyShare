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
        <span className="text-sm text-zinc-400 font-mono truncate max-w-[140px]">
          {account.address.toString().slice(0, 6)}…{account.address.toString().slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="px-3 py-1.5 rounded-lg bg-surface-muted border border-border text-zinc-300 hover:bg-surface-elevated hover:border-accent/50 text-sm transition-colors"
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
        className="px-4 py-2 rounded-lg bg-accent text-surface font-medium hover:bg-accent-muted transition-colors"
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
          <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-xl bg-surface-elevated border border-border shadow-xl py-2">
            {wallets.length === 0 ? (
              <p className="px-4 py-2 text-sm text-zinc-500">
                No wallets found. Install Petra or another Aptos wallet.
              </p>
            ) : (
              wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => handleConnect(wallet.name)}
                  className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-surface-muted transition-colors flex items-center gap-2"
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
