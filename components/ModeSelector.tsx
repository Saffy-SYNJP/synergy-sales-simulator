"use client";
import { Mode } from "@/lib/prompts";

interface Props {
  value: Mode;
  onChange: (m: Mode) => void;
}

const MODES: { id: Mode; label: string; icon: string; desc: string; color: string; activeColor: string }[] = [
  { id: "prospect", label: "Prospect Sim", icon: "🎯", desc: "You sell to AI", color: "gold", activeColor: "border-gold bg-gold/10 shadow-glow-sm" },
  { id: "demo", label: "Watch AI Sell", icon: "👁", desc: "AI sells to you", color: "accent-purple", activeColor: "border-accent-purple bg-accent-purple/10" },
  { id: "coach", label: "Coach Mode", icon: "🧠", desc: "Get scored", color: "accent-green", activeColor: "border-accent-green bg-accent-green/10" },
];

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MODES.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`relative p-3 rounded-xl border text-center transition-all active:scale-[0.97] ${
              active
                ? m.activeColor
                : "border-navy-border bg-navy-card hover:border-gray-600"
            }`}
          >
            <div className="text-xl mb-1">{m.icon}</div>
            <div className="font-semibold text-xs">{m.label}</div>
            <div className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">{m.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
