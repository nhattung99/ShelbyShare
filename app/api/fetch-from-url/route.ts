import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

function getFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
  } catch {
    // ignore
  }
  return "download";
}

export async function POST(request: NextRequest) {
  let url: string;
  try {
    const body = await request.json();
    url = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Send { \"url\": \"...\" }" },
      { status: 400 }
    );
  }

  if (!url || !url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "Valid URL (http/https) is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "ShelbyShare/1.0" },
      signal: AbortSignal.timeout(60000), // 60s
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source returned ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` },
        { status: 413 }
      );
    }

    const disposition = res.headers.get("content-disposition");
    let filename = getFilenameFromUrl(url);
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
        || disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match?.[1]) filename = match[1].trim();
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` },
        { status: 413 }
      );
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "X-Filename": encodeURIComponent(filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json(
      { error: "Could not fetch from URL", details: message },
      { status: 502 }
    );
  }
}
