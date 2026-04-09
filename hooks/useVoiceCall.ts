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
  const playedIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoListenRef = useRef(false);
  const silenceWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drainCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playback = useVoicePlayback();

  const resetSilenceWatchdog = useCallback(() => {
    if (silenceWatchdogRef.current) clearTimeout(silenceWatchdogRef.current);
    silenceWatchdogRef.current = null;
  }, []);

  const voice = useVoiceInput({
    onTranscript: (text) => {
      setLiveTranscript(text);
      // Speech detected — reset the silence watchdog
      resetSilenceWatchdog();
    },
    onFinal: (text) => {
      resetSilenceWatchdog();
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

  // When AI finishes streaming, STOP MIC then play TTS
  useEffect(() => {
    if (!active) return;
    if (aiLoading) return;
    if (!latestAssistantText || !latestAssistantId) return;
    if (lastSpokenIdRef.current === latestAssistantId) return;

    // Hard guard: never play the same message twice
    if (playedIdsRef.current.has(latestAssistantId)) return;
    playedIdsRef.current.add(latestAssistantId);
    lastSpokenIdRef.current = latestAssistantId;
    const cleaned = latestAssistantText
      .replace(/\*[^*]+\*/g, "")           // strip *action descriptions*
      .replace(/\[[^\]]+\]/g, "")           // strip [translations]
      .replace(/💡 TIP:[^\n]*/g, "")        // strip TIP lines
      .replace(/📊 MID-CALL COACHING[\s\S]*/g, "")
      .replace(/SCORES:[\s\S]*/g, "")
      .replace(/\s{2,}/g, " ")              // collapse leftover whitespace
      .trim();

    if (cleaned) {
      // ECHO FIX: kill mic BEFORE audio plays
      voice.stop();
      resetSilenceWatchdog();
      setPhase("ai_speaking");
      playback.play(cleaned, voiceRole);
      autoListenRef.current = true;
    }
  }, [active, aiLoading, latestAssistantText, latestAssistantId, voiceRole, playback, voice, resetSilenceWatchdog]);

  // Helper: open mic with silence watchdog
  const openMicWithWatchdog = useCallback(() => {
    setPhase("listening");
    voice.start();
    silenceWatchdogRef.current = setTimeout(() => {
      if (!active) return;
      voice.stop();
      setTimeout(() => {
        if (!active) return;
        voice.start();
        silenceWatchdogRef.current = setTimeout(() => {
          if (!active) return;
          voice.stop();
          setPhase("idle");
          setLiveTranscript("");
        }, 5000);
      }, 300);
    }, 5000);
  }, [active, voice]);

  // When AI finishes speaking, double-check playback is truly done, then open mic
  useEffect(() => {
    if (!active) return;
    if (!autoListenRef.current) return;
    if (playback.speaking) return;

    // First check passed (speaking === false).
    // Wait 500ms and check again to be sure audio hardware is fully silent.
    autoListenRef.current = false;
    drainCheckRef.current = setTimeout(() => {
      if (!active) return;
      if (playback.speaking) {
        // Still speaking — wait for next cycle
        autoListenRef.current = true;
        return;
      }
      // Second check passed — wait full drain gap then open mic
      setTimeout(() => {
        if (active) openMicWithWatchdog();
      }, 1500); // 1500ms drain gap — speaker output fully cleared
    }, 500); // 500ms between double-check

    return () => {
      if (drainCheckRef.current) clearTimeout(drainCheckRef.current);
    };
  }, [active, playback.speaking, openMicWithWatchdog, playback]);

  // Track voice status → phase
  useEffect(() => {
    if (voice.status === "recording") setPhase("listening");
  }, [voice.status]);

  const startListening = useCallback(() => {
    playback.stop();
    resetSilenceWatchdog();
    // 1500ms drain gap before opening mic
    setTimeout(() => openMicWithWatchdog(), 1500);
  }, [playback, resetSilenceWatchdog, openMicWithWatchdog]);

  const stopListening = useCallback(() => {
    resetSilenceWatchdog();
    if (drainCheckRef.current) { clearTimeout(drainCheckRef.current); drainCheckRef.current = null; }
    voice.stop();
    setPhase("idle");
  }, [voice, resetSilenceWatchdog]);

  const interrupt = useCallback(() => {
    playback.stop();
    autoListenRef.current = false;
    resetSilenceWatchdog();
    if (drainCheckRef.current) { clearTimeout(drainCheckRef.current); drainCheckRef.current = null; }
    // 1500ms drain gap after killing audio
    setTimeout(() => openMicWithWatchdog(), 1500);
  }, [playback, resetSilenceWatchdog, openMicWithWatchdog]);

  // Cleanup on deactivate
  useEffect(() => {
    if (!active) {
      resetSilenceWatchdog();
      if (drainCheckRef.current) { clearTimeout(drainCheckRef.current); drainCheckRef.current = null; }
      voice.stop();
      playback.stop();
      setPhase("idle");
      setLiveTranscript("");
      lastSpokenIdRef.current = null;
      autoListenRef.current = false;
    }
  }, [active, voice, playback, resetSilenceWatchdog]);

  return {
    phase,
    callDuration,
    liveTranscript,
    audioLevel: voice.level,
    speaking: playback.speaking,
    voiceError: voice.errorMessage,
    startListening,
    stopListening,
    interrupt,
  };
}
