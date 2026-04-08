"use client";
import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mode } from "@/lib/prompts";
import { MarketId, MARKETS } from "@/lib/markets";
import { EMPTY_SCORE, updateScore } from "@/lib/scoring";
import { ObjectionSelection } from "./ObjectionPicker";
import MessageBubble from "./MessageBubble";
import ScoreTracker from "./ScoreTracker";
import QuickActions from "./QuickActions";
import VoiceStatusBar from "./VoiceStatusBar";
import SessionSummary, { SummaryData } from "./SessionSummary";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoicePlayback } from "@/hooks/useVoicePlayback";
import { VoiceRole } from "@/lib/voices";

interface Props {
  mode: Mode;
  marketId: MarketId | null;
  objection: ObjectionSelection;
}

export default function ChatPanel({ mode, marketId, objection }: Props) {
  const voiceEnabled = process.env.NEXT_PUBLIC_VOICE_ENABLED === "true";
  const [voiceMode, setVoiceMode] = useState(false);
  const [score, setScore] = useState(EMPTY_SCORE);
  const [midCallRequested, setMidCallRequested] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  const market = marketId ? MARKETS[marketId] : undefined;

  const body = useMemo(
    () => ({
      mode,
      marketId: marketId ?? undefined,
      objectionId: objection.kind === "specific" ? objection.id : null,
      category: objection.kind === "category" ? objection.category : null,
      randomMix: objection.kind === "random",
      midCallCoaching: midCallRequested,
    }),
    [mode, marketId, objection, midCallRequested]
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    append,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body,
    onError: (err) => {
      console.error("[useChat] error:", err);
    },
  });

  const playback = useVoicePlayback();

  const voiceRole: VoiceRole = useMemo(() => {
    if (mode === "coach") return "coach";
    if (mode === "demo") return "ai_rep";
    return (marketId ?? "philippines") as VoiceRole;
  }, [mode, marketId]);

  const voice = useVoiceInput({
    onTranscript: (t) => setInput(t),
    onFinal: (t) => {
      if (!t.trim()) return;
      append({ role: "user", content: t });
      setInput("");
    },
    language:
      marketId === "vietnam"
        ? "vi-VN"
        : marketId === "philippines"
        ? "fil-PH"
        : "en-US",
  });

  // Auto-scroll with requestAnimationFrame to avoid layout blocking
  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [messages, isLoading]);

  // Update score on each new user message
  useEffect(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setScore((prev) => updateScore(prev, lastUser.content));
    }
  }, [messages]);

  // Auto mid-call coaching every 8 user messages in prospect mode
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  useEffect(() => {
    if (mode === "prospect" && userMsgCount > 0 && userMsgCount % 8 === 0) {
      setMidCallRequested(true);
    } else {
      setMidCallRequested(false);
    }
  }, [userMsgCount, mode]);

  // Auto-play last assistant response when voice mode is on
  useEffect(() => {
    if (!voiceMode || !voiceEnabled) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || isLoading) return;
    if (lastSpokenIdRef.current === lastAssistant.id) return;
    lastSpokenIdRef.current = lastAssistant.id;
    const spoken = lastAssistant.content
      .replace(/\[[^\]]+\]/g, "")
      .replace(/💡 TIP:[^\n]*/g, "")
      .trim();
    if (spoken) playback.play(spoken, voiceRole);
  }, [messages, isLoading, voiceMode, voiceEnabled, voiceRole, playback]);

  // Interruption: user starts speaking while AI is playing → stop playback
  useEffect(() => {
    if (voice.status === "recording" && playback.speaking) {
      playback.stop();
    }
  }, [voice.status, playback]);

  const needsMarket = mode !== "coach" && !marketId;
  const canEndSession = messages.length >= 2 && !sessionEnded && !isLoading;

  const handleMicToggle = () => {
    if (voice.status === "recording") voice.stop();
    else voice.start();
  };

  const handleQuickAction = (text: string) => {
    append({ role: "user", content: text });
  };

  const handleEndSession = useCallback(async () => {
    if (messages.length < 2) return;
    setSessionEnded(true);
    setSummaryLoading(true);
    setSummaryError(null);
    setSummary(null);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as SummaryData;
      setSummary(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSummaryError(msg);
    } finally {
      setSummaryLoading(false);
    }
  }, [messages]);

  const handlePracticeAgain = useCallback(() => {
    setSessionEnded(false);
    setSummary(null);
    setSummaryError(null);
    setScore(EMPTY_SCORE);
    setMessages([]);
    setInput("");
  }, [setMessages, setInput]);

  const handleNewSession = useCallback(() => {
    handlePracticeAgain();
    // Page-level reset is handled by parent via prop changes — here we just reset local state
  }, [handlePracticeAgain]);

  return (
    <div className="flex flex-col h-full bg-navy rounded-lg border border-navy-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-surface flex-shrink-0">
        <div className="text-sm font-semibold">
          {mode === "prospect" && market && `🎯 Selling to ${market.personaName} (${market.flag} ${market.country})`}
          {mode === "demo" && `👁 Watch AI Sell${market ? ` — to ${market.country}` : ""}`}
          {mode === "coach" && "🧠 Coach Mode"}
        </div>
        <div className="flex items-center gap-2">
          {voiceEnabled && mode !== "coach" && !sessionEnded && (
            <button
              onClick={() => setVoiceMode((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                voiceMode
                  ? "bg-gold/20 border-gold text-gold"
                  : "bg-navy-surface border-navy-surface text-gray-400"
              }`}
            >
              {voiceMode ? "🔊 Voice ON" : "🔇 Voice OFF"}
            </button>
          )}
          {canEndSession && (
            <button
              onClick={handleEndSession}
              className="text-xs px-3 py-1.5 rounded-full border border-red-500/50 text-red-300 hover:bg-red-500/20 transition"
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Score tracker — prospect only, not during summary */}
      {mode === "prospect" && !sessionEnded && (
        <div className="px-4 py-2 border-b border-navy-surface flex-shrink-0">
          <ScoreTracker score={score} />
        </div>
      )}

      {/* Summary screen */}
      {sessionEnded && (
        <div className="flex-1 overflow-hidden">
          {summaryLoading && (
            <div className="flex items-center justify-center h-full text-gray-400 gap-2">
              <span className="typing-dot" />
              <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
              <span className="typing-dot" style={{ animationDelay: "0.30s" }} />
              <span className="ml-2 text-sm">Generating your coaching report…</span>
            </div>
          )}
          {summaryError && (
            <div className="p-4">
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <div className="font-semibold mb-1">Summary failed</div>
                <div>{summaryError}</div>
              </div>
              <button
                onClick={() => { setSessionEnded(false); setSummaryError(null); }}
                className="mt-3 text-xs text-gray-400 hover:text-gold"
              >
                ← Back to conversation
              </button>
            </div>
          )}
          {summary && (
            <SessionSummary
              summary={summary}
              onPracticeAgain={handlePracticeAgain}
              onNewSession={handleNewSession}
            />
          )}
        </div>
      )}

      {/* Messages — hidden during summary */}
      {!sessionEnded && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {needsMarket && (
              <div className="text-center text-gray-500 text-sm py-12">
                Select a market to begin.
              </div>
            )}
            {!needsMarket && messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-12">
                {mode === "prospect" &&
                  "Open the call — introduce yourself and Synergy."}
                {mode === "demo" &&
                  "Throw an objection below and watch the AI handle it."}
                {mode === "coach" &&
                  "Describe your call situation or paste a transcript for coaching."}
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role as "user" | "assistant"}
                content={m.content}
                mode={mode}
                voiceEnabled={voiceEnabled && voiceMode}
                onReplay={() => {
                  const spoken = m.content
                    .replace(/\[[^\]]+\]/g, "")
                    .replace(/💡 TIP:[^\n]*/g, "")
                    .trim();
                  if (spoken) playback.play(spoken, voiceRole);
                }}
              />
            ))}
            {isLoading && (
              <div className="flex gap-1 px-3 py-2">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.30s" }} />
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <div className="font-semibold mb-0.5">Chat error</div>
                <div className="whitespace-pre-wrap">{error.message}</div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          {!needsMarket && (
            <div className="px-4 py-2 border-t border-navy-surface flex-shrink-0">
              <QuickActions mode={mode} onPick={handleQuickAction} />
            </div>
          )}

          {/* Voice status bar */}
          {voiceEnabled && voiceMode && (
            <div className="px-4 py-2 border-t border-navy-surface flex-shrink-0">
              <VoiceStatusBar
                listening={voice.status === "recording"}
                processing={voice.status === "processing" || isLoading}
                speaking={playback.speaking}
                level={voice.level}
              />
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t border-navy-surface flex-shrink-0"
          >
            <input
              value={input}
              onChange={handleInputChange}
              disabled={needsMarket || isLoading}
              placeholder={
                needsMarket
                  ? "Select a market first..."
                  : mode === "coach"
                  ? "Describe your call or paste a transcript..."
                  : "Type your line..."
              }
              className="flex-1 bg-navy-surface border border-navy-surface focus:border-gold rounded px-3 py-2 text-sm outline-none disabled:opacity-50"
            />
            {voiceEnabled && voiceMode && mode !== "coach" ? (
              <button
                type="button"
                onClick={handleMicToggle}
                className={`px-4 rounded text-sm font-semibold transition ${
                  voice.status === "recording"
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-gold text-navy"
                }`}
              >
                {voice.status === "recording" ? "● REC" : "🎤"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={needsMarket || isLoading}
                className="px-4 rounded bg-gold text-navy text-sm font-semibold disabled:opacity-50"
              >
                Send
              </button>
            )}
            {playback.speaking && (
              <button
                type="button"
                onClick={playback.stop}
                className="px-3 rounded bg-red-500/20 border border-red-500 text-red-300 text-xs"
              >
                Mute
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
