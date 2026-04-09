"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Mode } from "@/lib/prompts";
import { Market, MarketId } from "@/lib/markets";
import { getConvaiOverrides } from "@/lib/convai";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  mode: Mode;
  market?: Market;
  marketId: MarketId | null;
  onEndCall: (transcript: TranscriptLine[], duration: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceCallPanel({ mode, market, marketId, onEndCall }: Props) {
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const callStartRef = useRef(Date.now());

  const conversation = useConversation({
    onConnect: () => {
      setConnecting(false);
      setError(null);
    },
    onDisconnect: () => {
      const duration = Math.round((Date.now() - callStartRef.current) / 1000);
      // Use ref to get latest transcript since state may be stale in closure
      onEndCall(transcriptRef.current, duration);
    },
    onError: (message: string) => {
      console.error("[ConvAI] error:", message);
      setError(message || "Connection error");
      setConnecting(false);
    },
    onMessage: (props: { message: string; source: "user" | "ai" }) => {
      if (!props.message?.trim()) return;
      const role = props.source === "user" ? "user" as const : "assistant" as const;
      setTranscript((prev) => {
        const next = [...prev, { role, text: props.message }];
        transcriptRef.current = next;
        return next;
      });
    },
  });

  // Start connection on mount
  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (!marketId) {
        setError("No market selected");
        setConnecting(false);
        return;
      }

      try {
        // Get signed URL from our server
        const res = await fetch("/api/convai");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
        }
        const { signedUrl } = (await res.json()) as { signedUrl: string };

        if (cancelled) return;

        // Build overrides for this market/mode
        const overrides = getConvaiOverrides(mode, marketId);

        await conversation.startSession({
          signedUrl,
          overrides: {
            agent: {
              prompt: { prompt: overrides.prompt },
              firstMessage: overrides.firstMessage,
              language: "en",
            },
            tts: {
              voiceId: overrides.voiceId,
            },
          },
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to connect");
          setConnecting(false);
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call timer
  useEffect(() => {
    callStartRef.current = Date.now();
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleEndCall = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch {
      // If endSession fails, still fire the callback
      const duration = Math.round((Date.now() - callStartRef.current) / 1000);
      onEndCall(transcript, duration);
    }
  }, [conversation, onEndCall, transcript]);

  const personaName = market?.personaName ?? (mode === "coach" ? "Sales Coach" : "AI Representative");
  const personaDetail = market ? `${market.role} · ${market.city}` : mode === "coach" ? "Hormozi-Style Coach" : "Synergy Lubricant";

  const isSpeaking = conversation.isSpeaking;
  const status = conversation.status;

  let phaseLabel = "Call connected";
  let phaseColor = "text-gray-400";
  let ringColor = "border-gray-600";

  if (connecting) {
    phaseLabel = "Connecting...";
    phaseColor = "text-gold";
    ringColor = "border-gold";
  } else if (isSpeaking) {
    phaseLabel = `${personaName} is speaking`;
    phaseColor = "text-accent-blue";
    ringColor = "border-accent-blue";
  } else if (status === "connected") {
    phaseLabel = "Listening...";
    phaseColor = "text-accent-green";
    ringColor = "border-accent-green";
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-navy-DEFAULT/98 backdrop-blur-xl animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-border/30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-accent-green animate-pulse" : connecting ? "bg-gold animate-pulse" : "bg-gray-600"}`} />
          <span className="text-xs text-gray-400">{status === "connected" ? "Live Call" : connecting ? "Connecting" : "Disconnected"}</span>
        </div>
        <span className="text-sm font-mono text-gold tabular-nums">{formatTime(callDuration)}</span>
        <span className="text-xs text-gray-500">
          {mode === "prospect" ? "🎯 Prospect Sim" : mode === "demo" ? "👁 Watch AI" : "🧠 Coach"}
        </span>
      </div>

      {/* Main call area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        {/* Persona info */}
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-100">{personaName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{personaDetail}</div>
          {market && <div className="text-lg mt-1">{market.flag}</div>}
        </div>

        {/* Phase ring */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36">
          {(isSpeaking || (status === "connected" && !isSpeaking)) && (
            <div className={`absolute inset-0 rounded-full border-2 ${ringColor} animate-ping opacity-20`} />
          )}
          <div className={`absolute inset-0 rounded-full border-3 ${ringColor} transition-all duration-300`} />
          <div className="absolute inset-2 rounded-full bg-navy-card flex items-center justify-center">
            <span className="text-4xl sm:text-5xl">
              {connecting ? "⏳" : isSpeaking ? "🔊" : status === "connected" ? "🎤" : "📞"}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className={`text-sm font-medium ${phaseColor}`}>{phaseLabel}</div>

        {/* Error */}
        {error && (
          <div className="max-w-sm text-center px-4 py-2 rounded-xl bg-accent-red/10 border border-accent-red/30">
            <span className="text-xs text-red-300">{error}</span>
          </div>
        )}
      </div>

      {/* Transcript feed */}
      <div className="max-h-[25vh] overflow-y-auto px-4 py-2 border-t border-navy-border/30">
        <div className="max-w-lg mx-auto space-y-2">
          {transcript.length === 0 && !connecting && (
            <div className="text-center text-xs text-gray-600 py-2">
              Just speak naturally — the AI will respond
            </div>
          )}
          {transcript.map((line, i) => (
            <div key={i} className={`text-xs leading-relaxed ${line.role === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block max-w-[85%] rounded-lg px-3 py-1.5 ${
                line.role === "user"
                  ? "bg-gold/10 text-gray-200 border border-gold/20"
                  : "bg-navy-card text-gray-300 border border-navy-border/50"
              }`}>
                <span className="font-semibold text-[10px] block mb-0.5 opacity-60">
                  {line.role === "user" ? "You" : personaName}
                </span>
                {line.text.length > 150 ? line.text.slice(0, 150) + "..." : line.text}
              </span>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Call controls */}
      <div className="px-4 py-5 sm:py-6 border-t border-navy-border/30 safe-bottom">
        <div className="flex items-center justify-center gap-6">
          {/* Mute toggle */}
          <button
            onClick={() => conversation.setVolume({ volume: isSpeaking ? 0 : 1 })}
            className="w-14 h-14 rounded-full bg-navy-card border-2 border-navy-border text-lg flex items-center justify-center hover:border-gray-500 active:scale-90 transition-all"
          >
            {isSpeaking ? "🔇" : "🔊"}
          </button>

          {/* End call */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-accent-red flex items-center justify-center text-xl text-white hover:bg-red-600 active:scale-90 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            📞
          </button>
        </div>

        <div className="text-center text-[10px] text-gray-600 mt-3">
          {connecting ? "Setting up WebRTC connection..." : "Speak naturally — AI handles turn detection"}
        </div>
      </div>
    </div>
  );
}
