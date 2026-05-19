import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://127.0.0.1:3099";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const maxWidth = searchParams.get("max_width") || "400";

  if (!reference) {
    return NextResponse.json({ error: "Photo reference required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE}/api/photo?reference=${reference}&max_width=${maxWidth}`);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch photo" }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Photo proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch photo" }, { status: 500 });
  }
}
