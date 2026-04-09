import { MarketId } from "./markets";

export type VoiceRole = MarketId | "ai_rep" | "coach";

export const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.75,
  style: 0.2,
  use_speaker_boost: true,
  speed: 0.95,
};

export function getVoiceIdForRole(role: VoiceRole): string | undefined {
  const map: Record<VoiceRole, string | undefined> = {
    philippines: process.env.ELEVENLABS_VOICE_PHILIPPINES,
    vietnam: process.env.ELEVENLABS_VOICE_VIETNAM,
    myanmar: process.env.ELEVENLABS_VOICE_MYANMAR,
    india: process.env.ELEVENLABS_VOICE_INDIA,
    ai_rep: process.env.ELEVENLABS_VOICE_AI_REP,
    coach: process.env.ELEVENLABS_VOICE_COACH,
  };
  return map[role];
}

export const ELEVENLABS_MODEL = "eleven_flash_v2_5";
