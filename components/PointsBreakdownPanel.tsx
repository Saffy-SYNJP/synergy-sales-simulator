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
    <div className="flex justify-between text-sm">
      <span className="text-gray-300">{label}</span>
      <span className="text-gold font-mono">+{pts}</span>
    </div>
  );
}

export default function PointsBreakdownPanel({ breakdown, newBadges }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Points Earned
      </h3>
      <div className="bg-navy-surface rounded-lg p-4 border border-navy-surface space-y-1.5">
        <Line label="Session Complete" pts={breakdown.sessionComplete} />
        <Line label="Objection Handled" pts={breakdown.objectionHandled} />
        <Line label="Prospect Qualified" pts={breakdown.prospectQualified} />
        <Line label="White-Label Pitched" pts={breakdown.whiteLabelPitched} />
        <Line label="Visit Close Made" pts={breakdown.visitCloseMade} />
        <Line label="Score Bonus" pts={breakdown.scoreBonus} />
        <Line label="Perfect Session (all pills)" pts={breakdown.perfectSession} />
        <Line label="Streak Bonus" pts={breakdown.streakBonus} />
        <Line label="Market Mastery" pts={breakdown.marketMastery} />
        <Line label="Voice Mode (1.5x)" pts={breakdown.voiceMultiplier} />
        <div className="border-t border-navy pt-2 mt-2 flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-gold">+{breakdown.total}</span>
        </div>
      </div>

      {newBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Badges Earned
          </h3>
          <div className="flex gap-2 flex-wrap">
            {newBadges.map((id) => {
              const badge = ALL_BADGES.find((b) => b.id === id);
              if (!badge) return null;
              return (
                <div
                  key={id}
                  className="bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 text-center"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div className="text-xs font-semibold mt-0.5">{badge.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
