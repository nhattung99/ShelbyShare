/**
 * Server-side Shelby client for marketplace: upload (with signer) and getBlob for download.
 * Requires: SHELBY_API_KEY, NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY, NEXT_PUBLIC_APP_URL.
 * Shelbynet requires Origin header on every request; Node does not send it by default, so we patch fetch.
 */
import { Network, Ed25519PrivateKey, Account } from "@aptos-labs/ts-sdk";
import {
  ShelbyNodeClient,
  generateCommitments,
  createDefaultErasureCodingProvider,
} from "@shelby-protocol/sdk/node";

/** Shelbynet fullnode (chain ID 110). Use SHELBYNET so tx is not rejected with BAD_CHAIN_ID. */
const SHELBY_FULLNODE =
  process.env.NEXT_PUBLIC_SHELBY_FULLNODE ?? "https://api.shelbynet.shelby.xyz/v1";

let _client: ShelbyNodeClient | null = null;
let _fetchPatched = false;

function getOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000"
  );
}

function patchFetchForShelby(origin: string, apiKey: string | undefined): void {
  if (_fetchPatched) return;
  _fetchPatched = true;
  const orig = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    if (url.includes("shelby.xyz")) {
      const headers = new Headers(init?.headers ?? {});
      if (!headers.has("Origin")) headers.set("Origin", origin);
      if (apiKey && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${apiKey}`);
      init = { ...init, headers };
    }
    return orig(input, init);
  };
}

export function getShelbyClient(): ShelbyNodeClient {
  if (!_client) {
    const apiKey = process.env.SHELBY_API_KEY ?? process.env.NEXT_PUBLIC_SHELBY_API_KEY;
    patchFetchForShelby(getOrigin(), apiKey);
    const aptosConfig: { network: typeof Network.SHELBYNET; fullnode: string; clientConfig: Record<string, unknown> } = {
      network: Network.SHELBYNET,
      fullnode: SHELBY_FULLNODE,
      clientConfig: { HEADERS: { Origin: getOrigin() } },
    };
    if (apiKey) {
      aptosConfig.clientConfig.API_KEY = apiKey;
    }
    _client = new ShelbyNodeClient({
      network: Network.SHELBYNET,
      ...(apiKey ? { apiKey } : {}),
      aptos: aptosConfig,
    });
  }
  return _client;
}

export function getMarketplaceSigner(): Account {
  const raw = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
  if (!raw) throw new Error("NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY is not set");
  const hex = raw.replace(/^ed25519-priv-/, "");
  return Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(hex) });
}

export function buildBlobPath(sellerAddress: string, filename: string): string {
  const addrSuffix = sellerAddress.replace(/^0x/, "").slice(-8);
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40);
  return `datasets/${addrSuffix}/${Date.now()}-${safe}`;
}

export function defaultExpirationMicros(): number {
  return Date.now() * 1000 + 5 * 365 * 24 * 60 * 60 * 1_000_000;
}

export function parseBlobName(fullBlobName: string): { account: string; blobPath: string } {
  const idx = fullBlobName.indexOf("/");
  if (idx === -1) throw new Error(`Invalid blob name: ${fullBlobName}`);
  return {
    account: fullBlobName.slice(0, idx),
    blobPath: fullBlobName.slice(idx + 1),
  };
}

export function merkleRootToBytes(hexMerkleRoot: string): number[] {
  const hex = hexMerkleRoot.startsWith("0x") ? hexMerkleRoot.slice(2) : hexMerkleRoot;
  return Array.from(Buffer.from(hex, "hex"));
}

export { generateCommitments, createDefaultErasureCodingProvider };
