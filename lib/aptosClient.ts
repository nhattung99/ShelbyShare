import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(
  new AptosConfig({
    network: (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) ?? Network.TESTNET,
    ...(process.env.NEXT_PUBLIC_APTOS_NODE_URL ? { fullnode: process.env.NEXT_PUBLIC_APTOS_NODE_URL } : {}),
    ...(process.env.NEXT_PUBLIC_APTOS_API_KEY
      ? { clientConfig: { API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY } }
      : {}),
  })
);

export function aptosClient() {
  return aptos;
}
