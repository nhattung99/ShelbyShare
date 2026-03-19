import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

function getUploadsDir() {
  const root = process.cwd();
  return path.join(root, "uploads");
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const shareId = formData.get("shareId");
    const blobName = formData.get("blobName");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid 'file' field" },
        { status: 400 }
      );
    }
    if (typeof shareId !== "string" || !shareId) {
      return NextResponse.json(
        { error: "Missing or invalid 'shareId' field" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` },
        { status: 413 }
      );
    }

    const safeName = sanitizeName(
      (typeof blobName === "string" && blobName) || file.name || "file"
    );
    const uploadsDir = getUploadsDir();
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, `${shareId}__${safeName}`);

    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to mirror file locally", details: message },
      { status: 500 }
    );
  }
}

