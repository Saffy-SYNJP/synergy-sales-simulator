/**
 * Voice configuration for Phase 2 voice features.
 * All voice features are gated behind NEXT_PUBLIC_VOICE_ENABLED=true.
 * Set voice IDs in .env.local after purchasing ElevenLabs voices.
 */

export const VOICE_CONFIG = {
  Philippines: process.env.ELEVENLABS_VOICE_PHILIPPINES || "",
  Vietnam: process.env.ELEVENLABS_VOICE_VIETNAM || "",
  Myanmar: process.env.ELEVENLABS_VOICE_MYANMAR || "",
  India: process.env.ELEVENLABS_VOICE_INDIA || "",
  AIRep: process.env.ELEVENLABS_VOICE_AI_REP || "",
  Coach: process.env.ELEVENLABS_VOICE_COACH || "",
} as const;

export const TTS_SETTINGS = {
  model: "eleven_flash_v2_5",
  stability: 0.40,
  similarity_boost: 0.75,
  style: 0.20,
  use_speaker_boost: true,
  speed: 0.95,
} as const;

export const STT_CONFIG = {
  model: "nova-2",
  silenceThresholdMs: 1500,
  interimResults: true,
  punctuate: true,
  smartFormat: true,
} as const;
