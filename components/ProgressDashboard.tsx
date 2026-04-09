"use client";
import { useEffect, useState } from "react";
import { getUserStats, UserStats, LEVELS } from "@/lib/gamification";
import { ALL_BADGES, getUnlockedBadges, BadgeId } from "@/lib/store";

interface Props {
  email: string;
}

export default function ProgressDashboard({ email }: Props) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<BadgeId[]>([]);

  useEffect(() => {
    setStats(getUserStats(email));
    setBadges(getUnlockedBadges(email));
  }, [email]);

  if (!stats) return null;

  const { level, progress } = stats;
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gold">My Progress</h2>

      {/* Level + Progress Bar */}
      <div className="bg-navy-surface rounded-lg p-4 border border-navy-surface">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{level.icon}</div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">Level {level.level}</span>
              <span className="text-gold font-semibold">{level.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{level.message}</p>
            {nextLevel && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{progress.current} pts</span>
                  <span>{progress.needed} pts to {nextLevel.icon} {nextLevel.name}</span>
                </div>
                <div className="w-full h-2 bg-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
            {!nextLevel && (
              <div className="mt-2 text-xs text-gold">Max level reached!</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-xs text-gray-400">total pts</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Today" value={stats.sessionsToday.toString()} sub="sessions" />
        <StatCard label="This Week" value={stats.sessionsWeek.toString()} sub="sessions" />
        <StatCard label="Total" value={stats.sessionsTotal.toString()} sub="sessions" />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          sub="score 70+"
          color={stats.winRate >= 70 ? "text-green-400" : stats.winRate >= 50 ? "text-yellow-400" : "text-red-400"}
        />
        <StatCard label="Streak" value={`${stats.currentStreak}`} sub="days" />
        <StatCard label="Strongest" value={stats.strongestMarket} sub="market" />
        <StatCard label="Weakest" value={stats.weakestMarket} sub="market" />
        <StatCard label="Badges" value={badges.length.toString()} sub={`of ${ALL_BADGES.length}`} />
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Achievements
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {ALL_BADGES.map((b) => {
            const unlocked = badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-lg p-3 text-center border ${
                  unlocked
                    ? "bg-gold/10 border-gold/30"
                    : "bg-navy-surface border-navy-surface opacity-40"
                }`}
              >
                <div className="text-2xl">{b.icon}</div>
                <div className="text-xs font-semibold mt-1">{b.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{b.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="bg-navy-surface rounded-lg p-3 border border-navy-surface">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color || ""}`}>{value}</div>
      <div className="text-[10px] text-gray-500">{sub}</div>
    </div>
  );
}
