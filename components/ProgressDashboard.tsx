"use client";
import { useEffect, useState } from "react";
import { getUserStats, UserStats, LEVELS } from "@/lib/gamification";
import { ALL_BADGES, getUnlockedBadges, BadgeId } from "@/lib/store";

interface Props { email: string; }

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
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gradient-gold">My Progress</h2>

      {/* Level Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-3xl flex-shrink-0">
            {level.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-bold">Level {level.level}</span>
              <span className="text-gold font-semibold text-sm">{level.name}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{level.message}</p>
            {nextLevel && (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>{progress.current} pts earned</span>
                  <span>{progress.needed - progress.current} to {nextLevel.icon} {nextLevel.name}</span>
                </div>
                <div className="w-full h-2.5 bg-navy rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-gold rounded-full transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}
            {!nextLevel && <div className="mt-2 text-xs text-gold font-medium">🏆 Max level reached!</div>}
          </div>
          <div className="text-right flex-shrink-0 hidden sm:block">
            <div className="text-3xl font-bold text-gradient-gold">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-[11px] text-gray-500">total points</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Today" value={stats.sessionsToday.toString()} sub="sessions" />
        <StatCard label="This Week" value={stats.sessionsWeek.toString()} sub="sessions" />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} sub="score ≥70"
          color={stats.winRate >= 70 ? "text-accent-green" : stats.winRate >= 50 ? "text-gold" : "text-accent-red"} />
        <StatCard label="Streak" value={`${stats.currentStreak}d`} sub="consecutive" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.sessionsTotal.toString()} sub="sessions" />
        <StatCard label="Points" value={stats.totalPoints.toLocaleString()} sub="total" color="text-gold" />
        <StatCard label="Strongest" value={stats.strongestMarket} sub="market" />
        <StatCard label="Weakest" value={stats.weakestMarket} sub="market" />
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Achievements ({badges.length}/{ALL_BADGES.length})
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {ALL_BADGES.map((b) => {
            const unlocked = badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-xl p-3 text-center border transition-all ${
                  unlocked ? "glass-card border-gold/20 shadow-glow-sm" : "bg-navy-surface border-navy-border opacity-30"
                }`}
              >
                <div className="text-2xl">{b.icon}</div>
                <div className="text-[11px] font-semibold mt-1">{b.name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">{b.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="glass-card rounded-xl p-3">
      <div className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color || "text-gray-100"}`}>{value}</div>
      <div className="text-[10px] text-gray-600">{sub}</div>
    </div>
  );
}
