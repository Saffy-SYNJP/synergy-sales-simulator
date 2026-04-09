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

function renderContent(content: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\[[^\]]+\])|(💡 TIP:[^\n]*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
    if (match[1]) {
      parts.push(
        <span key={key++} className="text-accent-cyan/80 italic text-[13px]">{match[1]}</span>
      );
    } else if (match[2]) {
      parts.push(
        <span key={key++} className="text-accent-purple font-medium block mt-2 text-[12px] bg-accent-purple/5 rounded-lg px-2.5 py-1.5 border-l-2 border-accent-purple/40">
          {match[2]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) parts.push(content.slice(lastIndex));
  return parts;
}

export default function MessageBubble({ role, content, mode, onReplay, voiceEnabled }: Props) {
  const rendered = useMemo(() => renderContent(content), [content]);
  const isUser = role === "user";
  const isCoach = mode === "coach";

  if (isCoach && !isUser) {
    return (
      <div className="w-full glass-card rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed animate-fade-in border-l-2 border-accent-green/40">
        {rendered}
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-gold/15 border border-gold/25 text-gray-100 rounded-br-md"
            : "glass-card text-gray-200 rounded-bl-md"
        }`}
      >
        {rendered}
        {!isUser && voiceEnabled && onReplay && (
          <button
            onClick={onReplay}
            className="mt-2 text-[10px] text-gray-500 hover:text-gold transition-colors"
          >
            🔊 Replay
          </button>
        )}
      </div>
    </div>
  );
}
