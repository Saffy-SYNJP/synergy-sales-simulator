"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type STTStatus = "idle" | "recording" | "processing" | "error";

interface Options {
  onTranscript: (text: string) => void;
  onFinal: (text: string) => void;
  silenceMs?: number;
  language?: string;
}

/**
 * Voice input hook using the Web Speech API (built into Chrome/Edge, no API key needed).
 * Falls back to Deepgram WebSocket only if Web Speech API is unavailable.
 * Auto-fires onFinal after `silenceMs` of silence.
 */
export function useVoiceInput({
  onTranscript,
  onFinal,
  silenceMs = 1500,
  language = "en-US",
}: Options) {
  const [status, setStatus] = useState<STTStatus>("idle");
  const [level, setLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimBuffer = useRef("");
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  // Track whether we *want* to be recording — survives across re-renders
  const wantRecordingRef = useRef(false);

  const onTranscriptRef = useRef(onTranscript);
  const onFinalRef = useRef(onFinal);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFinalRef.current = onFinal; }, [onFinal]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      if (interimBuffer.current.trim()) {
        onFinalRef.current(interimBuffer.current.trim());
        interimBuffer.current = "";
      }
    }, silenceMs);
  }, [silenceMs]);

  const setupLevelMeter = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(avg / 255);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // AudioContext may fail in some environments — non-fatal
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setLevel(0);
  }, []);

  const stop = useCallback(() => {
    wantRecordingRef.current = false;
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    cleanupAudio();
    setStatus("idle");
  }, [cleanupAudio]);

  const start = useCallback(async () => {
    // If already recording, do nothing
    if (recognitionRef.current) return;

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      console.warn("[useVoiceInput] Web Speech API not available in this browser");
      setStatus("error");
      return;
    }

    // Get mic stream for level meter
    try {
      setStatus("processing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setupLevelMeter(stream);
    } catch {
      // Level meter is optional — continue without it
    }

    wantRecordingRef.current = true;
    interimBuffer.current = "";

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;

    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          interim += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      interimBuffer.current = interim;
      onTranscriptRef.current(interim);
      resetSilenceTimer();
    };

    rec.onerror = (e: any) => {
      // "aborted" and "no-speech" are non-fatal — restart if we still want to record
      if (e.error === "aborted" || e.error === "no-speech") {
        return;
      }
      console.error("[useVoiceInput] SpeechRecognition error:", e.error);
      setStatus("error");
      wantRecordingRef.current = false;
    };

    rec.onend = () => {
      // Web Speech API stops after silence or a timeout.
      // Restart automatically if we still want to be recording.
      if (wantRecordingRef.current) {
        try {
          rec.start();
        } catch {
          // Already started or other issue — ignore
        }
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setStatus("recording");
    } catch {
      setStatus("error");
      wantRecordingRef.current = false;
    }
  }, [language, resetSilenceTimer, setupLevelMeter]);

  useEffect(() => {
    return () => {
      wantRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return { status, level, start, stop };
}
