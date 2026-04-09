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
import PointsBreakdownPanel from "./PointsBreakdownPanel";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoicePlayback } from "@/hooks/useVoicePlayback";
import { VoiceRole } from "@/lib/voices";
import { recordSession, PointsBreakdown } from "@/lib/gamification";
import { BadgeId } from "@/lib/store";

interface Props {
  mode: Mode;
  marketId: MarketId | null;
  objection: ObjectionSelection;
  userEmail: string;
  userName: string;
  onSessionEnd?: (result: { leveledUp: boolean; newLevel: number }) => void;
}

export default function ChatPanel({ mode, marketId, objection, userEmail, userName, onSessionEnd }: Props) {
  const voiceEnabled = process.env.NEXT_PUBLIC_VOICE_ENABLED === "true";
  const [voiceMode, setVoiceMode] = useState(false);
  const [score, setScore] = useState(EMPTY_SCORE);
  const [midCallRequested, setMidCallRequested] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [pointsResult, setPointsResult] = useState<{ breakdown: PointsBreakdown; newBadges: BadgeId[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
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
    messages, input, handleInputChange, handleSubmit, isLoading, setInput, append, error, setMessages,
  } = useChat({
    api: "/api/chat",
    body,
    onError: (err) => console.error("[useChat] error:", err),
  });

  const playback = useVoicePlayback();
  const voiceRole: VoiceRole = useMemo(() => {
    if (mode === "coach") return "coach";
    if (mode === "demo") return "ai_rep";
    return (marketId ?? "philippines") as VoiceRole;
  }, [mode, marketId]);

  const voice = useVoiceInput({
    onTranscript: (t) => setInput(t),
    onFinal: (t) => { if (!t.trim()) return; append({ role: "user", content: t }); setInput(""); },
    language: marketId === "vietnam" ? "vi-VN" : marketId === "philippines" ? "fil-PH" : "en-US",
  });

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (messages.length === prevMsgCountRef.current) return;
    prevMsgCountRef.current = messages.length;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) setScore((prev) => updateScore(prev, lastUser.content as string));
  }, [messages]);

  const userMsgCount = messages.filter((m) => m.role === "user").length;
  useEffect(() => {
    if (mode === "prospect" && userMsgCount > 0 && userMsgCount % 8 === 0) setMidCallRequested(true);
    else setMidCallRequested(false);
  }, [userMsgCount, mode]);

  useEffect(() => {
    if (!voiceMode || !voiceEnabled) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || isLoading) return;
    if (lastSpokenIdRef.current === lastAssistant.id) return;
    lastSpokenIdRef.current = lastAssistant.id;
    const spoken = lastAssistant.content.replace(/\[[^\]]+\]/g, "").replace(/💡 TIP:[^\n]*/g, "").trim();
    if (spoken) playback.play(spoken, voiceRole);
  }, [messages, isLoading, voiceMode, voiceEnabled, voiceRole, playback]);

  useEffect(() => {
    if (voice.status === "recording" && playback.speaking) playback.stop();
  }, [voice.status, playback]);

  const needsMarket = mode !== "coach" && !marketId;
  const canEndSession = messages.length >= 2 && !sessionEnded && !isLoading;

  const handleEndSession = useCallback(async () => {
    if (messages.length < 2) return;
    setSessionEnded(true); setSummaryLoading(true); setSummaryError(null); setSummary(null); setPointsResult(null);
    try {
      const res = await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`); }
      const data = await res.json() as SummaryData;
      setSummary(data);
      const objStr = objection.kind === "specific" ? `objection_${objection.id}` : objection.kind === "category" ? objection.category : objection.kind === "random" ? "random" : "free";
      const result = recordSession(userEmail, userName, mode, marketId || "coach", objStr, data, voiceMode);
      setPointsResult({ breakdown: result.points, newBadges: result.newBadges });
      if (onSessionEnd) onSessionEnd({ leveledUp: result.leveledUp, newLevel: result.newLevel });
    } catch (err) { setSummaryError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSummaryLoading(false); }
  }, [messages, userEmail, userName, mode, marketId, objection, voiceMode, onSessionEnd]);

  const handlePracticeAgain = useCallback(() => {
    setSessionEnded(false); setSummary(null); setSummaryError(null); setPointsResult(null); setScore(EMPTY_SCORE); setMessages([]); setInput("");
  }, [setMessages, setInput]);

  const modeLabel = mode === "prospect" && market
    ? `Selling to ${market.personaName}`
    : mode === "demo"
    ? `Watch AI Sell${market ? ` · ${market.country}` : ""}`
    : "Coach Mode";

  const modeIcon = mode === "prospect" ? "🎯" : mode === "demo" ? "👁" : "🧠";

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-navy-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm flex-shrink-0">{modeIcon}</span>
          <span className="text-sm font-semibold truncate">{modeLabel}</span>
          {market && <span className="text-xs text-gray-500 hidden sm:inline">{market.flag}</span>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {voiceEnabled && mode !== "coach" && !sessionEnded && (
            <button
              onClick={() => setVoiceMode((v) => !v)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                voiceMode ? "bg-gold/15 border-gold/40 text-gold" : "bg-navy-card border-navy-border text-gray-500"
              }`}
            >
              {voiceMode ? "🔊 ON" : "🔇"}
            </button>
          )}
          {canEndSession && (
            <button
              onClick={handleEndSession}
              className="text-[11px] px-2.5 py-1 rounded-full border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition-all"
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Score pills */}
      {mode === "prospect" && !sessionEnded && (
        <div className="px-3 sm:px-4 py-2 border-b border-navy-border flex-shrink-0">
          <ScoreTracker score={score} />
        </div>
      )}

      {/* Summary */}
      {sessionEnded && (
        <div className="flex-1 overflow-y-auto">
          {summaryLoading && (
            <div className="flex items-center justify-center h-full text-gray-400 gap-2">
              <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: "0.15s" }} /><span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              <span className="ml-2 text-sm">Generating report...</span>
            </div>
          )}
          {summaryError && (
            <div className="p-4">
              <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-xs text-red-300">
                <div className="font-semibold mb-1">Summary failed</div>
                <div>{summaryError}</div>
              </div>
              <button onClick={() => { setSessionEnded(false); setSummaryError(null); }} className="mt-3 text-xs text-gray-500 hover:text-gold">← Back</button>
            </div>
          )}
          {summary && (
            <div className="p-3 sm:p-4 space-y-4">
              <SessionSummary summary={summary} onPracticeAgain={handlePracticeAgain} onNewSession={handlePracticeAgain} />
              {pointsResult && <PointsBreakdownPanel breakdown={pointsResult.breakdown} newBadges={pointsResult.newBadges} />}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {!sessionEnded && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {needsMarket && <div className="text-center text-gray-600 text-sm py-16">Select a market to begin</div>}
            {!needsMarket && messages.length === 0 && (
              <div className="text-center text-gray-600 text-sm py-16">
                {mode === "prospect" && "Open the call — introduce yourself and Synergy"}
                {mode === "demo" && "Throw an objection and watch the AI handle it"}
                {mode === "coach" && "Describe your call or paste a transcript"}
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
                  const spoken = m.content.replace(/\[[^\]]+\]/g, "").replace(/💡 TIP:[^\n]*/g, "").trim();
                  if (spoken) playback.play(spoken, voiceRole);
                }}
              />
            ))}
            {isLoading && (
              <div className="flex gap-1.5 px-3 py-2">
                <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: "0.15s" }} /><span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-3 py-2 text-xs text-red-300 animate-fade-in">
                <div className="font-semibold mb-0.5">Error</div>
                <div className="whitespace-pre-wrap">{error.message}</div>
              </div>
            )}
            <div ref={scrollAnchorRef} />
          </div>

          {!needsMarket && (
            <div className="px-3 sm:px-4 py-2 border-t border-navy-border flex-shrink-0">
              <QuickActions mode={mode} onPick={(text) => append({ role: "user", content: text })} />
            </div>
          )}

          {voiceEnabled && voiceMode && (
            <div className="px-3 sm:px-4 py-2 border-t border-navy-border flex-shrink-0">
              <VoiceStatusBar listening={voice.status === "recording"} processing={voice.status === "processing" || isLoading} speaking={playback.speaking} level={voice.level} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-navy-border flex-shrink-0 safe-bottom">
            <input
              value={input}
              onChange={handleInputChange}
              disabled={needsMarket || isLoading}
              placeholder={needsMarket ? "Select a market..." : mode === "coach" ? "Describe your call..." : "Type your line..."}
              className="flex-1 bg-navy-surface border border-navy-border focus:border-gold focus:ring-1 focus:ring-gold/20 rounded-xl px-3 py-2.5 text-sm outline-none disabled:opacity-40 transition-all"
            />
            {voiceEnabled && voiceMode && mode !== "coach" ? (
              <button
                type="button"
                onClick={() => voice.status === "recording" ? voice.stop() : voice.start()}
                className={`w-11 h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center ${
                  voice.status === "recording" ? "bg-accent-red text-white animate-pulse" : "bg-gradient-gold text-navy"
                }`}
              >
                {voice.status === "recording" ? "●" : "🎤"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={needsMarket || isLoading}
                className="px-4 h-11 rounded-xl bg-gradient-gold text-navy-DEFAULT text-sm font-bold disabled:opacity-40 hover:shadow-glow-sm active:scale-95 transition-all"
              >
                Send
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
