import { NextRequest, NextResponse } from "next/server";
import {
  getShelbyClient,
  getMarketplaceSigner,
  buildBlobPath,
  defaultExpirationMicros,
  merkleRootToBytes,
  generateCommitments,
  createDefaultErasureCodingProvider,
} from "@/lib/marketplace/shelbyServer";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const fileField = formData.get("file");
  const sellerAddress = formData.get("sellerAddress");

  if (!(fileField instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }
  if (typeof sellerAddress !== "string" || !sellerAddress) {
    return NextResponse.json({ error: "Missing sellerAddress field" }, { status: 400 });
  }

  const blobData = new Uint8Array(await fileField.arrayBuffer());
  const blobPath = buildBlobPath(sellerAddress, fileField.name);

  let shelby: ReturnType<typeof getShelbyClient>;
  let signer: ReturnType<typeof getMarketplaceSigner>;
  try {
    shelby = getShelbyClient();
    signer = getMarketplaceSigner();
  } catch (err) {
    console.error("[datasets/upload] init failed:", err);
    return NextResponse.json(
      { error: "Server not configured for marketplace upload. Set NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY." },
      { status: 503 }
    );
  }

  let commitments: Awaited<ReturnType<typeof generateCommitments>>;
  try {
    const provider = await createDefaultErasureCodingProvider();
    commitments = await generateCommitments(provider, blobData);
  } catch (err) {
    console.error("[datasets/upload] commitments failed:", err);
    return NextResponse.json({ error: "Failed to compute commitments" }, { status: 500 });
  }

  try {
    await shelby.upload({
      blobData,
      signer,
      blobName: blobPath,
      expirationMicros: defaultExpirationMicros(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[datasets/upload] Shelby upload failed:", err);
    return NextResponse.json(
      {
        error: "Failed to upload dataset to Shelby storage",
        details: message,
      },
      { status: 502 }
    );
  }

  const publisherAddress = signer.accountAddress.toString();
  const shelbyBlobName = `${publisherAddress}/${blobPath}`;
  const commitmentBytes = merkleRootToBytes(commitments.blob_merkle_root);

  return NextResponse.json({
    shelbyBlobName,
    commitmentBytes,
    blobSize: blobData.length,
  });
}
