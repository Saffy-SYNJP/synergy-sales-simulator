"use client";

/**
 * useVoice — unified Phase 2 voice hook.
 * Combines speech-to-text (useVoiceInput) and text-to-speech (useVoicePlayback)
 * into a single interface for convenience.
 *
 * Gated behind NEXT_PUBLIC_VOICE_ENABLED. When the flag is false, all functions
 * are no-ops so callers don't need to check the flag individually.
 */

import { useCallback, useRef } from "react";
import { useVoiceInput } from "./useVoiceInput";
import { useVoicePlayback } from "./useVoicePlayback";
import { VoiceRole } from "@/lib/voices";

interface UseVoiceOptions {
  /** Called with interim transcript text as the user speaks */
  onTranscript?: (text: string) => void;
  /** Called with the final transcript after silence is detected */
  onFinal?: (text: string) => void;
  /** Silence detection threshold in ms (default: 1500) */
  silenceMs?: number;
  /** BCP-47 language code for STT (e.g. "en-US", "vi-VN") */
  language?: string;
}

export function useVoice(options: UseVoiceOptions = {}) {
  const voiceEnabled = process.env.NEXT_PUBLIC_VOICE_ENABLED === "true";

  const lastSpokenRef = useRef<string | null>(null);

  const input = useVoiceInput({
    onTranscript: options.onTranscript ?? (() => {}),
    onFinal: options.onFinal ?? (() => {}),
    silenceMs: options.silenceMs ?? 1500,
    language: options.language ?? "en-US",
  });

  const playback = useVoicePlayback();

  /**
   * Start microphone recording.
   * Tries Deepgram WebSocket first, falls back to Web Speech API.
   */
  const startRecording = useCallback(() => {
    if (!voiceEnabled) return;
    input.start();
  }, [voiceEnabled, input]);

  /**
   * Stop microphone recording.
   */
  const stopRecording = useCallback(() => {
    if (!voiceEnabled) return;
    input.stop();
  }, [voiceEnabled, input]);

  /**
   * Synthesise text to speech via the ElevenLabs TTS endpoint and play it.
   * @param text    Plain text to synthesise (strip brackets and TIP lines before calling).
   * @param voiceId The VoiceRole key to select the correct ElevenLabs voice.
   */
  const playAudio = useCallback(
    (text: string, voiceId: VoiceRole) => {
      if (!voiceEnabled) return;
      if (lastSpokenRef.current === text) return;
      lastSpokenRef.current = text;
      playback.play(text, voiceId);
    },
    [voiceEnabled, playback]
  );

  /**
   * Stop AI audio playback immediately (interruption handling).
   */
  const stopAudio = useCallback(() => {
    if (!voiceEnabled) return;
    playback.stop();
  }, [voiceEnabled, playback]);

  return {
    // STT state
    sttStatus: input.status,       // "idle" | "recording" | "processing" | "error"
    level: input.level,             // 0-1 audio input level for UI meters

    // TTS state
    speaking: playback.speaking,    // true while AI audio is playing

    // Actions
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,

    // Convenience: is the voice system enabled at all?
    voiceEnabled,
  };
}
