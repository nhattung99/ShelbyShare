"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { ShelbyClientProvider } from "@shelby-protocol/react";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { useMemo } from "react";

const network = (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) ?? Network.TESTNET;
const aptosApiKey = process.env.NEXT_PUBLIC_APTOS_API_KEY ?? "";
const shelbyApiKey = process.env.NEXT_PUBLIC_SHELBY_API_KEY ?? "";

const shelbyNetwork = Network.TESTNET;

function makeShelbyClient() {
  return new ShelbyClient({
    network: shelbyNetwork,
    apiKey: shelbyApiKey,
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const shelbyClient = useMemo(makeShelbyClient, []);

  if (typeof window !== "undefined") {
    // Helpful debug log for API key + origin (not sent to backend)
    // Only logs prefix and length so you can compare with Geomi dashboard.
    // Example output: Shelby key prefix: AG-3PWB..., length: 36, origin: http://localhost:3001
    // If this looks correct but you still get 401, the issue is on the Shelby/Geomi side.
    // eslint-disable-next-line no-console
    console.log(
      "Shelby key prefix:",
      shelbyApiKey ? `${shelbyApiKey.slice(0, 7)}...` : "(empty)",
      "length:",
      shelbyApiKey.length,
      "origin:",
      window.location.origin
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect
        dappConfig={{
          network,
          aptosApiKeys: network === Network.TESTNET ? { testnet: aptosApiKey } : undefined,
        }}
        onError={(err) => console.warn("Wallet error:", err)}
      >
        <ShelbyClientProvider client={shelbyClient}>
          {children}
        </ShelbyClientProvider>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
