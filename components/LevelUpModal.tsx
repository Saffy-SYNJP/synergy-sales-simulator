"use client";
import { Level, LEVELS } from "@/lib/gamification";

interface Props {
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, onClose }: Props) {
  const level = LEVELS.find((l) => l.level === newLevel) || LEVELS[0];

  const shareText = `I just reached Level ${level.level} — ${level.icon} ${level.name} in the Synergy Sales Training Engine! #SynergyLubricants #SalesTraining`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-navy-surface border border-gold/40 rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-bounce-in">
        <div className="text-6xl mb-4">{level.icon}</div>
        <h2 className="text-2xl font-bold text-gold mb-2">LEVEL UP!</h2>
        <div className="text-lg font-semibold mb-1">
          Level {level.level} — {level.name}
        </div>
        <p className="text-sm text-gray-400 mb-6">{level.message}</p>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded border border-navy text-sm text-gray-300 hover:border-gold hover:text-gold transition"
          >
            Share Achievement
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded bg-gold text-navy text-sm font-semibold hover:bg-gold/90 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
