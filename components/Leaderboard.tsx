"use client";
import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry, resetLeaderboard } from "@/lib/store";

interface Props {
  currentUserEmail: string;
  isAdmin: boolean;
}

const RANK_BADGES = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ currentUserEmail, isAdmin }: Props) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => { setBoard(getLeaderboard()); }, []);

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gradient-gold">Leaderboard</h2>
        {isAdmin && (
          <button
            onClick={() => { if (confirm("Reset the weekly leaderboard?")) { resetLeaderboard(); setBoard([]); } }}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition-all"
          >
            Reset Weekly
          </button>
        )}
      </div>

      {board.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <div className="text-gray-500 text-sm">No sessions yet. Start training to appear here!</div>
        </div>
      ) : (
        <>
          {/* Top 3 Cards (desktop) */}
          {board.length >= 1 && (
            <div className="hidden sm:grid grid-cols-3 gap-3">
              {board.slice(0, 3).map((entry, i) => {
                const isMe = entry.email === currentUserEmail;
                return (
                  <div key={entry.email} className={`glass-card rounded-2xl p-4 text-center ${isMe ? "border-gold/30 shadow-glow-sm" : ""}`}>
                    <div className="text-3xl mb-1">{RANK_BADGES[i]}</div>
                    <div className={`font-bold text-sm ${isMe ? "text-gold" : ""}`}>{entry.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{entry.levelIcon} {entry.levelName}</div>
                    <div className="text-lg font-bold text-gold mt-2 font-mono">{entry.points.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-600">{entry.sessionsCompleted} sessions · {entry.winRate}% win</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-navy-border">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Level</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Sessions</th>
                    <th className="px-4 py-3 text-right">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((entry, i) => {
                    const isMe = entry.email === currentUserEmail;
                    return (
                      <tr key={entry.email} className={`border-b border-navy-border/50 last:border-0 ${isMe ? "bg-gold/5" : ""}`}>
                        <td className="px-4 py-3 font-semibold text-gray-400">{i < 3 ? RANK_BADGES[i] : `${i + 1}`}</td>
                        <td className="px-4 py-3">
                          <span className={isMe ? "text-gold font-semibold" : ""}>{entry.name}</span>
                          {isMe && <span className="text-[9px] text-gray-600 ml-1">(you)</span>}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell text-xs">
                          {entry.levelIcon} {entry.levelName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gold font-semibold">{entry.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">{entry.sessionsCompleted}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={entry.winRate >= 70 ? "text-accent-green" : entry.winRate >= 50 ? "text-gold" : "text-accent-red"}>
                            {entry.winRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
