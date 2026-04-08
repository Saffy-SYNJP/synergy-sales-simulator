import { NextResponse } from "next/server";

// Issues a short-lived Deepgram key for browser WebSocket streaming.
// In production, scope this with tighter TTL and lower permissions.
export const runtime = "nodejs";

export async function POST() {
  if (process.env.NEXT_PUBLIC_VOICE_ENABLED !== "true") {
    return NextResponse.json({ error: "Voice disabled" }, { status: 403 });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Deepgram key not configured" }, { status: 500 });
  }

  // For simplicity we return the project API key directly.
  // In production swap this for the Deepgram key-provisioning API to mint a short-lived key.
  return NextResponse.json({ key: apiKey });
}
