"use client";
import { PointsBreakdown } from "@/lib/gamification";
import { BadgeId, ALL_BADGES } from "@/lib/store";

interface Props {
  breakdown: PointsBreakdown;
  newBadges: BadgeId[];
}

function Line({ label, pts }: { label: string; pts: number }) {
  if (pts === 0) return null;
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="text-gold font-mono font-semibold">+{pts}</span>
    </div>
  );
}

export default function PointsBreakdownPanel({ breakdown, newBadges }: Props) {
  return (
    <div className="space-y-3 animate-slide-up">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Points Earned</h3>
      <div className="glass-card rounded-xl p-4 space-y-1">
        <Line label="Session Complete" pts={breakdown.sessionComplete} />
        <Line label="Objection Handled" pts={breakdown.objectionHandled} />
        <Line label="Prospect Qualified" pts={breakdown.prospectQualified} />
        <Line label="White-Label Pitched" pts={breakdown.whiteLabelPitched} />
        <Line label="Visit Close Made" pts={breakdown.visitCloseMade} />
        <Line label="Score Bonus" pts={breakdown.scoreBonus} />
        <Line label="Perfect Session" pts={breakdown.perfectSession} />
        <Line label="Streak Bonus" pts={breakdown.streakBonus} />
        <Line label="Market Mastery" pts={breakdown.marketMastery} />
        <Line label="Voice Mode (1.5x)" pts={breakdown.voiceMultiplier} />
        <div className="border-t border-navy-border pt-2 mt-2 flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-gradient-gold">+{breakdown.total}</span>
        </div>
      </div>

      {newBadges.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Badges</h3>
          <div className="flex gap-2 flex-wrap">
            {newBadges.map((id) => {
              const badge = ALL_BADGES.find((b) => b.id === id);
              if (!badge) return null;
              return (
                <div key={id} className="glass-card border-gold/20 rounded-xl px-3 py-2 text-center shadow-glow-sm animate-scale-in">
                  <span className="text-xl">{badge.icon}</span>
                  <div className="text-[11px] font-semibold mt-0.5">{badge.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
