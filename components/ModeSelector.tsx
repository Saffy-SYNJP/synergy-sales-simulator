"use client";
import { Mode } from "@/lib/prompts";

interface Props {
  value: Mode;
  onChange: (m: Mode) => void;
}

const MODES: { id: Mode; label: string; icon: string; color: string }[] = [
  { id: "prospect", label: "Prospect Simulator", icon: "🎯", color: "gold" },
  { id: "demo", label: "Watch AI Sell", icon: "👁", color: "modePurple" },
  { id: "coach", label: "Coach Mode", icon: "🧠", color: "modeGreen" },
];

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MODES.map((m) => {
        const active = value === m.id;
        const borderColor =
          m.color === "gold"
            ? "#C9A227"
            : m.color === "modePurple"
            ? "#8b5cf6"
            : "#10b981";
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex-1 min-w-[160px] px-4 py-3 rounded-lg border-2 text-left transition"
            style={{
              borderColor: active ? borderColor : "#1e304d",
              background: active ? `${borderColor}20` : "#1e304d",
            }}
          >
            <div className="text-2xl">{m.icon}</div>
            <div className="font-semibold text-sm mt-1">{m.label}</div>
          </button>
        );
      })}
    </div>
  );
}
