"use client";

import { AccountAddress, Network } from "@aptos-labs/ts-sdk";
import {
  createDefaultErasureCodingProvider,
  expectedTotalChunksets,
  generateCommitments,
  ShelbyBlobClient,
  ShelbyClient,
  type BlobCommitments,
} from "@shelby-protocol/sdk/browser";

const SHELBY_NETWORK = Network.TESTNET;
const DEFAULT_EXPIRATION_DAYS = 30;

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_SHELBY_API_KEY ?? "";
}

/**
 * Create a Shelby client instance (browser).
 */
export function getShelbyClient(): ShelbyClient {
  return new ShelbyClient({
    network: SHELBY_NETWORK,
    apiKey: getApiKey(),
  });
}

/**
 * Encode a file into commitments for on-chain registration.
 */
export async function encodeFile(file: File): Promise<BlobCommitments> {
  const data =
    typeof Buffer !== "undefined" && Buffer.isBuffer(file)
      ? file
      : Buffer.from(await file.arrayBuffer());
  const provider = await createDefaultErasureCodingProvider();
  return generateCommitments(provider, data);
}

/**
 * Create the transaction payload for registering a blob on-chain.
 * The caller must sign and submit this via the wallet adapter.
 */
export function createRegisterBlobPayload(params: {
  accountAddress: string;
  blobName: string;
  commitments: BlobCommitments;
  expirationMicros?: number;
}) {
  const {
    accountAddress,
    blobName,
    commitments,
    expirationMicros =
      (Date.now() + 1000 * 60 * 60 * 24 * DEFAULT_EXPIRATION_DAYS) * 1000,
  } = params;
  return ShelbyBlobClient.createRegisterBlobPayload({
    account: AccountAddress.from(accountAddress),
    blobName,
    blobMerkleRoot: commitments.blob_merkle_root,
    numChunksets: expectedTotalChunksets(commitments.raw_data_size),
    expirationMicros,
    blobSize: commitments.raw_data_size,
    encoding: 0,
  });
}

/**
 * Upload blob data to Shelby RPC after on-chain registration.
 * Call this only after the register transaction is confirmed.
 */
export async function uploadBlobData(params: {
  accountAddress: string;
  blobName: string;
  blobData: Uint8Array;
}): Promise<void> {
  const client = getShelbyClient();
  await client.rpc.putBlob({
    account: params.accountAddress,
    blobName: params.blobName,
    blobData: params.blobData,
  });
}

/**
 * Download a file from Shelby storage by account and blob name.
 */
export async function downloadFile(
  accountAddress: string,
  blobName: string
): Promise<Uint8Array> {
  const client = getShelbyClient();
  const blob = await client.rpc.getBlob({
    account: accountAddress,
    blobName,
  });
  if (!blob?.readable) {
    throw new Error("Blob not found or empty");
  }
  const reader = blob.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Minimal file info from share id (account + name).
 * For full metadata (size, dates), use useBlobMetadata from @shelby-protocol/react.
 */
export interface FileInfo {
  account: string;
  name: string;
}

export function getFileInfoFromShareId(shareId: string): FileInfo | null {
  try {
    const decoded = decodeShareId(shareId);
    if (!decoded) return null;
    return { account: decoded.account, name: decoded.blobName };
  } catch {
    return null;
  }
}

/**
 * Encode account + blob name into a single share id (base64url).
 */
export function encodeShareId(accountAddress: string, blobName: string): string {
  const payload = `${accountAddress}::${blobName}`;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(payload, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(payload)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decode share id into account and blob name.
 */
export function decodeShareId(
  shareId: string
): { account: string; blobName: string } | null {
  try {
    let decoded: string;
    if (typeof Buffer !== "undefined") {
      decoded = Buffer.from(shareId, "base64url").toString("utf8");
    } else {
      decoded = decodeURIComponent(escape(atob(shareId.replace(/-/g, "+").replace(/_/g, "/"))));
    }
    const idx = decoded.indexOf("::");
    if (idx === -1) return null;
    return {
      account: decoded.slice(0, idx),
      blobName: decoded.slice(idx + 2),
    };
  } catch {
    return null;
  }
}
