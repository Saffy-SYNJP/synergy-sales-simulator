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

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  const handleReset = () => {
    if (confirm("Reset the weekly leaderboard? This cannot be undone.")) {
      resetLeaderboard();
      setBoard([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gold">Leaderboard</h2>
        {isAdmin && (
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 rounded border border-red-500/50 text-red-300 hover:bg-red-500/20 transition"
          >
            Reset Weekly
          </button>
        )}
      </div>

      {board.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-sm">
          No sessions completed yet. Start training to appear on the leaderboard!
        </div>
      ) : (
        <div className="bg-navy-surface rounded-lg border border-navy-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-navy">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Level</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Sessions</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {board.map((entry, i) => {
                const isMe = entry.email === currentUserEmail;
                return (
                  <tr
                    key={entry.email}
                    className={`border-b border-navy last:border-0 ${
                      isMe ? "bg-gold/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">
                      {i < 3 ? RANK_BADGES[i] : `#${i + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={isMe ? "text-gold font-semibold" : ""}>
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-gray-400 ml-1">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span title={entry.levelName}>
                        {entry.levelIcon} {entry.levelName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gold">
                      {entry.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.sessionsCompleted}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          entry.winRate >= 70
                            ? "text-green-400"
                            : entry.winRate >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }
                      >
                        {entry.winRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
