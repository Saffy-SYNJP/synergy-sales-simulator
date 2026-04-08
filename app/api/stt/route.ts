import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stt
 * Accepts an audio blob (multipart or raw binary), sends to Deepgram Nova-2,
 * and returns { transcript: string }.
 * Gated behind NEXT_PUBLIC_VOICE_ENABLED flag.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_VOICE_ENABLED !== "true") {
    return NextResponse.json({ error: "Voice disabled" }, { status: 403 });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "audio/webm";

  let audioBuffer: ArrayBuffer;
  try {
    audioBuffer = await req.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read audio data" }, { status: 400 });
  }

  if (audioBuffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty audio buffer" }, { status: 400 });
  }

  // Call Deepgram Nova-2 pre-recorded endpoint
  const dgUrl =
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true";

  let dgRes: Response;
  try {
    dgRes = await fetch(dgUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: audioBuffer,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: `Deepgram request failed: ${msg}` },
      { status: 502 }
    );
  }

  if (!dgRes.ok) {
    const body = await dgRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Deepgram error ${dgRes.status}: ${body}` },
      { status: dgRes.status }
    );
  }

  const data = await dgRes.json() as {
    results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
  };

  const transcript =
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

  return NextResponse.json({ transcript });
}
