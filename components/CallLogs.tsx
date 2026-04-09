"use client";
import { useState, useMemo } from "react";
import { getCallLogs, CallLogEntry } from "@/lib/store";

interface Props {
  email: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    ` ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function modeIcon(mode: string): string {
  if (mode === "prospect") return "🎯";
  if (mode === "demo") return "👁";
  return "🧠";
}

function TranscriptModal({ log, onClose }: { log: CallLogEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-border">
          <div>
            <div className="text-sm font-semibold text-gray-200">
              {modeIcon(log.mode)} Call with {log.personaName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {formatDate(log.timestamp)} · {formatDuration(log.duration)}
              {log.score !== null && ` · Score: ${log.score}/100`}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg px-2">✕</button>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {log.transcript.length === 0 && (
            <div className="text-center text-gray-600 text-xs py-8">No transcript recorded</div>
          )}
          {log.transcript.map((line, i) => (
            <div key={i} className={`flex ${line.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                line.role === "user"
                  ? "bg-gold/10 border border-gold/20 text-gray-200"
                  : "bg-navy-card border border-navy-border text-gray-300"
              }`}>
                <div className="font-semibold text-[10px] mb-0.5 opacity-50">
                  {line.role === "user" ? "You" : log.personaName}
                </div>
                {line.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CallLogs({ email }: Props) {
  const [selectedLog, setSelectedLog] = useState<CallLogEntry | null>(null);
  const logs = useMemo(() => getCallLogs(email), [email]);

  if (logs.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">📞</div>
        <div className="text-sm text-gray-400 font-medium">No call logs yet</div>
        <div className="text-xs text-gray-600 mt-1">Start a voice call in Training mode to see your history here</div>
      </div>
    );
  }

  return (
    <>
      {selectedLog && <TranscriptModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      <div className="space-y-2">
        {logs.map((log) => (
          <button
            key={log.id}
            onClick={() => setSelectedLog(log)}
            className="w-full glass-card rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gold/30 transition-all text-left group"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
              log.voiceCall ? "bg-accent-green/10 border border-accent-green/30" : "bg-navy-surface border border-navy-border"
            }`}>
              {log.voiceCall ? "📞" : "💬"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200 truncate">{log.personaName}</span>
                <span className="text-[10px] text-gray-600">{modeIcon(log.mode)} {log.mode}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-gray-500">{formatDate(log.timestamp)}</span>
                <span className="text-[11px] text-gray-600">·</span>
                <span className="text-[11px] text-gray-500">{formatDuration(log.duration)}</span>
                {log.transcript.length > 0 && (
                  <>
                    <span className="text-[11px] text-gray-600">·</span>
                    <span className="text-[11px] text-gray-500">{log.transcript.length} messages</span>
                  </>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              {log.score !== null ? (
                <div className={`text-sm font-bold ${
                  log.score >= 80 ? "text-accent-green" : log.score >= 50 ? "text-gold" : "text-accent-red"
                }`}>
                  {log.score}
                </div>
              ) : (
                <div className="text-xs text-gray-600">—</div>
              )}
              <div className="text-[10px] text-gray-600 group-hover:text-gold transition-colors">View</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
