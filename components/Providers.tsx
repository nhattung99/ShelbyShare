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
