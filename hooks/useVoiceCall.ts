"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceInput } from "./useVoiceInput";
import { useVoicePlayback } from "./useVoicePlayback";
import { VoiceRole } from "@/lib/voices";

export type CallPhase = "idle" | "listening" | "processing" | "ai_speaking";

interface UseVoiceCallOptions {
  /** BCP-47 language code */
  language: string;
  /** Voice role for TTS */
  voiceRole: VoiceRole;
  /** Called with the final user transcript to send to chat */
  onUserMessage: (text: string) => void;
  /** Whether the AI is currently streaming a response */
  aiLoading: boolean;
  /** The latest assistant message content (watched for completion) */
  latestAssistantText: string | null;
  /** Latest assistant message ID (to detect new messages) */
  latestAssistantId: string | null;
  /** Whether the call is active */
  active: boolean;
}

export function useVoiceCall({
  language,
  voiceRole,
  onUserMessage,
  aiLoading,
  latestAssistantText,
  latestAssistantId,
  active,
}: UseVoiceCallOptions) {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");

  const lastSpokenIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoListenRef = useRef(false);

  const playback = useVoicePlayback();

  const voice = useVoiceInput({
    onTranscript: (text) => {
      setLiveTranscript(text);
    },
    onFinal: (text) => {
      if (!text.trim()) return;
      setLiveTranscript("");
      setPhase("processing");
      onUserMessage(text);
    },
    silenceMs: 1800,
    language,
  });

  // Start call timer
  useEffect(() => {
    if (active) {
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  // When AI finishes streaming, play TTS
  useEffect(() => {
    if (!active) return;
    if (aiLoading) return;
    if (!latestAssistantText || !latestAssistantId) return;
    if (lastSpokenIdRef.current === latestAssistantId) return;

    lastSpokenIdRef.current = latestAssistantId;
    const cleaned = latestAssistantText
      .replace(/\[[^\]]+\]/g, "")
      .replace(/💡 TIP:[^\n]*/g, "")
      .replace(/📊 MID-CALL COACHING[\s\S]*/g, "")
      .replace(/SCORES:[\s\S]*/g, "")
      .trim();

    if (cleaned) {
      setPhase("ai_speaking");
      playback.play(cleaned, voiceRole);
      autoListenRef.current = true;
    }
  }, [active, aiLoading, latestAssistantText, latestAssistantId, voiceRole, playback]);

  // When AI finishes speaking, auto-start listening
  useEffect(() => {
    if (!active) return;
    if (!autoListenRef.current) return;
    if (playback.speaking) return;

    // Playback just ended — start listening
    autoListenRef.current = false;
    const delay = setTimeout(() => {
      if (active) {
        setPhase("listening");
        voice.start();
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [active, playback.speaking, voice]);

  // Track voice status → phase
  useEffect(() => {
    if (voice.status === "recording") setPhase("listening");
  }, [voice.status]);

  const startListening = useCallback(() => {
    playback.stop();
    setPhase("listening");
    voice.start();
  }, [playback, voice]);

  const stopListening = useCallback(() => {
    voice.stop();
    setPhase("idle");
  }, [voice]);

  const interrupt = useCallback(() => {
    playback.stop();
    autoListenRef.current = false;
    startListening();
  }, [playback, startListening]);

  // Cleanup on deactivate
  useEffect(() => {
    if (!active) {
      voice.stop();
      playback.stop();
      setPhase("idle");
      setLiveTranscript("");
      lastSpokenIdRef.current = null;
      autoListenRef.current = false;
    }
  }, [active, voice, playback]);

  return {
    phase,
    callDuration,
    liveTranscript,
    audioLevel: voice.level,
    speaking: playback.speaking,
    startListening,
    stopListening,
    interrupt,
  };
}
