import { NextRequest, NextResponse } from "next/server";
import { Ed25519PublicKey, Ed25519Signature, AccountAddress } from "@aptos-labs/ts-sdk";
import { consumeNonce } from "@/lib/marketplace/nonceStore";
import { getShelbyClient, parseBlobName } from "@/lib/marketplace/shelbyServer";
import { checkOnChainAccess, getOnChainBlobName, getAptosServerClient } from "@/lib/marketplace/aptosServer";
import { MODULE_ADDRESS } from "@/lib/constants";

const SIGN_MESSAGE_TEXT = "Shelby AI DataVault download auth";

function buildFullMessage(nonce: string): string {
  return `APTOS\nmessage: ${SIGN_MESSAGE_TEXT}\nnonce: ${nonce}`;
}

function verifyDownloadAuth(
  buyerAddress: string,
  nonce: string,
  publicKeyHex: string,
  signatureHex: string
): string | null {
  if (!consumeNonce(nonce)) return "Invalid or expired nonce.";
  let pubKey: Ed25519PublicKey;
  let sig: Ed25519Signature;
  try {
    pubKey = new Ed25519PublicKey(publicKeyHex);
    sig = new Ed25519Signature(signatureHex);
  } catch {
    return "Invalid public key or signature format.";
  }
  const fullMessage = buildFullMessage(nonce);
  const msgBytes = new TextEncoder().encode(fullMessage);
  if (!pubKey.verifySignature({ message: msgBytes, signature: sig })) return "Signature verification failed.";
  try {
    const derived = pubKey.authKey().derivedAddress();
    const claimed = AccountAddress.fromString(buyerAddress);
    if (derived.toString() !== claimed.toString()) return "Public key does not match buyer address.";
  } catch {
    return "Invalid buyer address format.";
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { datasetAddr: string } }
) {
  const datasetAddr = params.datasetAddr;

  const buyerAddress = req.headers.get("x-buyer-address");
  const nonce = req.headers.get("x-nonce");
  const signature = req.headers.get("x-signature");
  const publicKey = req.headers.get("x-public-key");

  if (!buyerAddress || !nonce || !signature || !publicKey) {
    return NextResponse.json(
      { error: "Missing headers: x-buyer-address, x-nonce, x-signature, x-public-key" },
      { status: 400 }
    );
  }

  const authError = verifyDownloadAuth(buyerAddress, nonce, publicKey, signature);
  if (authError) return NextResponse.json({ error: authError }, { status: 401 });

  let canAccess = await checkOnChainAccess(buyerAddress, datasetAddr);
  if (!canAccess) {
    try {
      const aptos = getAptosServerClient();
      const [, owner] = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_info`,
          typeArguments: [],
          functionArguments: [datasetAddr],
        },
      });
      const ownerNorm = AccountAddress.fromString(owner as string).toString();
      const buyerNorm = AccountAddress.fromString(buyerAddress).toString();
      if (ownerNorm === buyerNorm) canAccess = true;
    } catch {
      // ignore
    }
  }

  if (!canAccess) {
    return NextResponse.json({ error: "Access denied. Purchase this dataset first." }, { status: 403 });
  }

  let fullBlobName: string;
  try {
    fullBlobName = await getOnChainBlobName(datasetAddr);
  } catch (err) {
    console.error("[download] get_blob_name failed:", err);
    return NextResponse.json({ error: "Could not resolve dataset blob name." }, { status: 502 });
  }

  const { account, blobPath } = parseBlobName(fullBlobName);
  const shelby = getShelbyClient();

  let shelbyBlob: Awaited<ReturnType<typeof shelby.rpc.getBlob>>;
  try {
    shelbyBlob = await shelby.rpc.getBlob({ account, blobName: blobPath });
  } catch (err) {
    console.error("[download] Shelby getBlob failed:", err);
    return NextResponse.json({ error: "Failed to retrieve dataset from storage." }, { status: 502 });
  }

  const filename = blobPath.split("/").pop() ?? "dataset";

  return new NextResponse(shelbyBlob.readable as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
