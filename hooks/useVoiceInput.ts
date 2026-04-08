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
 * Voice input hook: tries Deepgram WebSocket streaming first,
 * falls back to the browser Web Speech API.
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

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimBuffer = useRef("");
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      if (interimBuffer.current.trim()) {
        onFinal(interimBuffer.current.trim());
        interimBuffer.current = "";
      }
    }, silenceMs);
  }, [onFinal, silenceMs]);

  const setupLevelMeter = (stream: MediaStream) => {
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
  };

  const stop = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setLevel(0);
    setStatus("idle");
  }, []);

  const startWebSpeechFallback = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus("error");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        interim += e.results[i][0].transcript;
      }
      interimBuffer.current = interim;
      onTranscript(interim);
      resetSilenceTimer();
    };
    rec.onerror = () => setStatus("error");
    rec.onend = () => {
      if (status === "recording") rec.start();
    };
    rec.start();
    recognitionRef.current = rec;
    setStatus("recording");
  }, [language, onTranscript, resetSilenceTimer, status]);

  const start = useCallback(async () => {
    try {
      setStatus("processing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setupLevelMeter(stream);

      // Try Deepgram
      let tokenRes: Response | null = null;
      try {
        tokenRes = await fetch("/api/stt/token", { method: "POST" });
      } catch {}

      if (tokenRes && tokenRes.ok) {
        const { key } = await tokenRes.json();
        const dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${encodeURIComponent(
          language.split("-")[0]
        )}&smart_format=true&interim_results=true&punctuate=true`;
        const ws = new WebSocket(dgUrl, ["token", key]);
        wsRef.current = ws;

        ws.onopen = () => {
          const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
          mediaRef.current = mr;
          mr.ondataavailable = (e) => {
            if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(e.data);
            }
          };
          mr.start(250);
          setStatus("recording");
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            const transcript =
              data.channel?.alternatives?.[0]?.transcript ?? "";
            if (transcript) {
              interimBuffer.current = transcript;
              onTranscript(transcript);
              resetSilenceTimer();
            }
          } catch {}
        };

        ws.onerror = () => {
          // Fallback on error
          ws.close();
          startWebSpeechFallback();
        };
      } else {
        startWebSpeechFallback();
      }
    } catch {
      setStatus("error");
    }
  }, [language, onTranscript, resetSilenceTimer, startWebSpeechFallback]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { status, level, start, stop };
}
