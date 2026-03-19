import { NextResponse } from "next/server";
import { createNonce } from "@/lib/marketplace/nonceStore";

export async function GET() {
  return NextResponse.json({ nonce: createNonce() });
}
