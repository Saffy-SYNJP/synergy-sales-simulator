"use client";
import { LEVELS } from "@/lib/gamification";

interface Props {
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, onClose }: Props) {
  const level = LEVELS.find((l) => l.level === newLevel) || LEVELS[0];
  const shareText = `I just reached Level ${level.level} — ${level.icon} ${level.name} in the Synergy Sales Training Engine! #SynergyLubricants #SalesTraining`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card border-gold/30 rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-glow">
        {/* Glow ring */}
        <div className="relative mx-auto w-24 h-24 mb-5">
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-pulse-gold" />
          <div className="relative w-24 h-24 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center">
            <span className="text-5xl">{level.icon}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gradient-gold mb-1">LEVEL UP!</h2>
        <div className="text-lg font-semibold text-gray-200">
          Level {level.level} — {level.name}
        </div>
        <p className="text-sm text-gray-500 mt-2 mb-6">{level.message}</p>

        <div className="flex gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(shareText); alert("Copied!"); }}
            className="flex-1 py-2.5 rounded-xl border border-navy-border text-sm text-gray-400 hover:border-gold/40 hover:text-gold transition-all active:scale-95"
          >
            Share
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-gold text-navy-DEFAULT text-sm font-bold hover:shadow-glow active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
