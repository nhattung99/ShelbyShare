import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

function getUploadsDir() {
  const root = process.cwd();
  return path.join(root, "uploads");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name") || "file";

  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, `${id}__${name}`);

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          name
        )}"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Not found";
    return NextResponse.json(
      { error: "File not mirrored locally", details: message },
      { status: 404 }
    );
  }
}

