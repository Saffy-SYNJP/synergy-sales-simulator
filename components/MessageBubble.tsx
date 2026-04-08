"use client";
import { useMemo } from "react";
import { Mode } from "@/lib/prompts";

interface Props {
  role: "user" | "assistant";
  content: string;
  mode: Mode;
  onReplay?: () => void;
  voiceEnabled?: boolean;
}

// Render bilingual inline translations in blue italic
// Bracketed text like "[English translation]" becomes styled
function renderContent(content: string, mode: Mode) {
  const parts: React.ReactNode[] = [];
  const regex = /(\[[^\]]+\])|(💡 TIP:[^\n]*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <span key={key++} className="text-blue-300 italic">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      parts.push(
        <span key={key++} className="text-modePurple font-semibold block mt-2">
          {match[2]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts;
}

export default function MessageBubble({
  role,
  content,
  mode,
  onReplay,
  voiceEnabled,
}: Props) {
  const rendered = useMemo(() => renderContent(content, mode), [content, mode]);
  const isCoach = mode === "coach";

  if (isCoach) {
    return (
      <div className="w-full bg-navy-surface border border-modeGreen/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
        {rendered}
      </div>
    );
  }

  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-gold/20 border border-gold/40 text-white"
            : "bg-navy-surface border border-navy-surface text-gray-100"
        }`}
      >
        {rendered}
        {!isUser && voiceEnabled && onReplay && (
          <button
            onClick={onReplay}
            className="mt-2 text-[10px] text-gray-400 hover:text-gold"
          >
            🔊 Replay
          </button>
        )}
      </div>
    </div>
  );
}
