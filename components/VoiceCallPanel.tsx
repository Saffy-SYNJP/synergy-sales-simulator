"use client";
import { useCallback, useEffect, useRef } from "react";
import { CallPhase } from "@/hooks/useVoiceCall";
import { Mode } from "@/lib/prompts";
import { Market } from "@/lib/markets";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  mode: Mode;
  market?: Market;
  phase: CallPhase;
  callDuration: number;
  audioLevel: number;
  liveTranscript: string;
  transcript: TranscriptLine[];
  onStartListening: () => void;
  onStopListening: () => void;
  onInterrupt: () => void;
  onEndCall: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function PhaseRing({ phase, audioLevel }: { phase: CallPhase; audioLevel: number }) {
  const scale = phase === "listening" ? 1 + audioLevel * 0.3 : 1;
  const colors: Record<CallPhase, string> = {
    idle: "border-gray-600",
    listening: "border-accent-green",
    processing: "border-gold",
    ai_speaking: "border-accent-blue",
  };

  return (
    <div className="relative w-28 h-28 sm:w-36 sm:h-36">
      {/* Outer pulse ring */}
      {(phase === "listening" || phase === "ai_speaking") && (
        <div
          className={`absolute inset-0 rounded-full border-2 ${colors[phase]} animate-ping opacity-20`}
        />
      )}
      {/* Main ring */}
      <div
        className={`absolute inset-0 rounded-full border-3 ${colors[phase]} transition-all duration-150`}
        style={{ transform: `scale(${scale})` }}
      />
      {/* Inner avatar area */}
      <div className="absolute inset-2 rounded-full bg-navy-card flex items-center justify-center">
        <span className="text-4xl sm:text-5xl">
          {phase === "listening" ? "🎤" : phase === "ai_speaking" ? "🔊" : phase === "processing" ? "⏳" : "📞"}
        </span>
      </div>
    </div>
  );
}

function WaveformBars({ level, active }: { level: number; active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: 12 }).map((_, i) => {
        const barLevel = active ? Math.max(0.1, level * (0.5 + 0.5 * Math.sin(Date.now() / 120 + i * 0.8))) : 0.08;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${
              active ? "bg-gold" : "bg-gray-700"
            }`}
            style={{ height: `${Math.max(3, barLevel * 32)}px` }}
          />
        );
      })}
    </div>
  );
}

export default function VoiceCallPanel({
  mode,
  market,
  phase,
  callDuration,
  audioLevel,
  liveTranscript,
  transcript,
  onStartListening,
  onStopListening,
  onInterrupt,
  onEndCall,
}: Props) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, liveTranscript]);

  const personaName = market?.personaName ?? (mode === "coach" ? "Sales Coach" : "AI Representative");
  const personaDetail = market ? `${market.role} · ${market.city}` : mode === "coach" ? "Hormozi-Style Coach" : "Synergy Lubricant";

  const phaseLabel: Record<CallPhase, string> = {
    idle: "Call connected",
    listening: "Listening...",
    processing: "Thinking...",
    ai_speaking: `${personaName} is speaking`,
  };

  const handleMicAction = useCallback(() => {
    if (phase === "listening") {
      onStopListening();
    } else if (phase === "ai_speaking") {
      onInterrupt();
    } else {
      onStartListening();
    }
  }, [phase, onStartListening, onStopListening, onInterrupt]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-navy-DEFAULT/98 backdrop-blur-xl animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-border/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs text-gray-400">Live Call</span>
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
        <PhaseRing phase={phase} audioLevel={audioLevel} />

        {/* Status */}
        <div className="text-sm text-gray-400 font-medium">{phaseLabel[phase]}</div>

        {/* Waveform */}
        <WaveformBars level={audioLevel} active={phase === "listening"} />

        {/* Live transcript preview */}
        {liveTranscript && (
          <div className="max-w-sm text-center px-4 py-2 rounded-xl bg-navy-card/80 border border-navy-border/50">
            <span className="text-xs text-gray-500 block mb-1">You&apos;re saying:</span>
            <span className="text-sm text-gray-200 italic">{liveTranscript}</span>
          </div>
        )}
      </div>

      {/* Transcript feed */}
      <div className="max-h-[25vh] overflow-y-auto px-4 py-2 border-t border-navy-border/30">
        <div className="max-w-lg mx-auto space-y-2">
          {transcript.length === 0 && (
            <div className="text-center text-xs text-gray-600 py-2">
              Tap the mic to start speaking
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
                {line.text.length > 120 ? line.text.slice(0, 120) + "..." : line.text}
              </span>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Call controls */}
      <div className="px-4 py-5 sm:py-6 border-t border-navy-border/30 safe-bottom">
        <div className="flex items-center justify-center gap-6">
          {/* Mic / Interrupt button */}
          <button
            onClick={handleMicAction}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all active:scale-90 ${
              phase === "listening"
                ? "bg-accent-green text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse-gold"
                : phase === "ai_speaking"
                ? "bg-navy-card border-2 border-accent-blue text-accent-blue hover:bg-accent-blue/10"
                : "bg-gradient-gold text-navy-DEFAULT shadow-glow-sm hover:shadow-glow"
            }`}
          >
            {phase === "listening" ? "🎤" : phase === "ai_speaking" ? "✋" : "🎤"}
          </button>

          {/* End call */}
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-accent-red flex items-center justify-center text-xl text-white hover:bg-red-600 active:scale-90 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            📞
          </button>
        </div>

        {/* Hint text */}
        <div className="text-center text-[10px] text-gray-600 mt-3">
          {phase === "listening" && "Speaking... tap mic to stop"}
          {phase === "ai_speaking" && "Tap ✋ to interrupt"}
          {phase === "idle" && "Tap mic to speak"}
          {phase === "processing" && "AI is preparing a response..."}
        </div>
      </div>
    </div>
  );
}
