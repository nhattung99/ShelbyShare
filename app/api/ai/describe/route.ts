import { NextRequest, NextResponse } from "next/server";

const MAX_TEXT_BYTES = 8000; // ~2k tokens for excerpt
const TEXT_TYPES = [
  "text/plain",
  "text/html",
  "text/css",
  "text/markdown",
  "application/json",
  "application/javascript",
  "application/xml",
];

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let file: File;
  try {
    const formData = await request.formData();
    file = formData.get("file") as File;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid 'file' in form data" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const name = file.name;
  const type = file.type || "application/octet-stream";
  const size = file.size;

  let excerpt = "";
  if (TEXT_TYPES.some((t) => type.toLowerCase().includes(t)) || type.startsWith("text/")) {
    try {
      const buffer = await file.slice(0, MAX_TEXT_BYTES).arrayBuffer();
      const decoder = new TextDecoder("utf-8", { fatal: false });
      excerpt = decoder.decode(buffer);
      if (excerpt.length > 0) excerpt = "\n\nContent excerpt:\n" + excerpt;
    } catch {
      // ignore
    }
  }

  const prompt = `You are a file assistant. Given the following file metadata and optional content excerpt, write a very short description (1-2 sentences, under 200 characters) and 2-4 comma-separated tags. Reply in this exact JSON format only, no markdown: {"description":"...","tags":"tag1, tag2, tag3"}

File name: ${name}
File type: ${type}
Size: ${size} bytes${excerpt}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "AI service error", details: err },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 502 }
      );
    }

    // Parse JSON from response (may be wrapped in markdown code block)
    let parsed: { description?: string; tags?: string };
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as { description?: string; tags?: string };
      } catch {
        parsed = { description: content, tags: "" };
      }
    } else {
      parsed = { description: content, tags: "" };
    }

    return NextResponse.json({
      description: parsed.description || content,
      tags: parsed.tags || "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "AI request failed", details: message },
      { status: 502 }
    );
  }
}
