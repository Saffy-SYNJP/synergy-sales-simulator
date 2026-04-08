import { NextRequest } from "next/server";
import { getVoiceIdForRole, VOICE_SETTINGS, ELEVENLABS_MODEL, VoiceRole } from "@/lib/voices";

export const runtime = "edge";

interface TTSBody {
  text: string;
  role: VoiceRole;
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_VOICE_ENABLED !== "true") {
    return new Response("Voice disabled", { status: 403 });
  }

  const { text, role } = (await req.json()) as TTSBody;
  const voiceId = getVoiceIdForRole(role);
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    return new Response("Voice or API key not configured", { status: 500 });
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL,
      voice_settings: VOICE_SETTINGS,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("ElevenLabs error", { status: upstream.status });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    },
  });
}
