"use client";
import { useEffect, useState } from "react";
import {
  getAllSessions,
  getLeaderboard,
  setPoints,
  resetLeaderboard,
  SessionRecord,
  LeaderboardEntry,
} from "@/lib/store";
import { getPoints } from "@/lib/store";

export default function AdminPanel() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [tab, setTab] = useState<"overview" | "sessions" | "manage">("overview");

  useEffect(() => {
    setSessions(getAllSessions());
    setBoard(getLeaderboard());
  }, []);

  const uniqueUsers = Array.from(new Set(sessions.map((s) => s.email)));

  const userSessions = selectedUser
    ? sessions.filter((s) => s.email === selectedUser)
    : sessions;

  const handleSetPoints = (email: string) => {
    const pts = parseInt(pointsInput);
    if (isNaN(pts)) return;
    setPoints(email, pts);
    setBoard(getLeaderboard());
    setPointsInput("");
    alert(`Points set to ${pts} for ${email}`);
  };

  const handleResetUser = (email: string) => {
    if (!confirm(`Reset ALL data for ${email}? This cannot be undone.`)) return;
    setPoints(email, 0);
    // Clear sessions
    localStorage.removeItem(`synergy_simulator_sessions_${email}`);
    localStorage.removeItem(`synergy_simulator_badges_${email}`);
    localStorage.removeItem(`synergy_simulator_streak_${email}`);
    setSessions(getAllSessions());
    setBoard(getLeaderboard());
  };

  const handleResetLeaderboard = () => {
    if (!confirm("Reset the weekly leaderboard?")) return;
    resetLeaderboard();
    setBoard([]);
  };

  const handleExportCSV = () => {
    const header = "Date,Email,Mode,Market,Objection,Score,Objection Handled,Qualified,White-Label,Visit Close,Points\n";
    const rows = sessions.map((s) => {
      const date = new Date(s.timestamp).toISOString();
      return `${date},${s.email},${s.mode},${s.market},${s.objection},${s.score},${s.pills.objectionHandled},${s.pills.prospectQualified},${s.pills.whiteLabelPitched},${s.pills.visitCloseMade},${s.pointsEarned}`;
    });
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synergy-sessions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gold">Admin Panel</h2>
        <div className="flex gap-2">
          {(["overview", "sessions", "manage"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs rounded border ${
                tab === t
                  ? "border-gold text-gold bg-gold/10"
                  : "border-navy-surface text-gray-400 hover:border-gray-500"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-navy-surface rounded-lg p-3 border border-navy-surface">
              <div className="text-xs text-gray-400">Total Users</div>
              <div className="text-xl font-bold">{uniqueUsers.length}</div>
            </div>
            <div className="bg-navy-surface rounded-lg p-3 border border-navy-surface">
              <div className="text-xs text-gray-400">Total Sessions</div>
              <div className="text-xl font-bold">{sessions.length}</div>
            </div>
            <div className="bg-navy-surface rounded-lg p-3 border border-navy-surface">
              <div className="text-xs text-gray-400">Avg Score</div>
              <div className="text-xl font-bold">
                {sessions.length > 0
                  ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
                  : "—"}
              </div>
            </div>
            <div className="bg-navy-surface rounded-lg p-3 border border-navy-surface">
              <div className="text-xs text-gray-400">Win Rate (70+)</div>
              <div className="text-xl font-bold">
                {sessions.length > 0
                  ? Math.round((sessions.filter((s) => s.score >= 70).length / sessions.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          {/* Per-user breakdown */}
          <div className="bg-navy-surface rounded-lg border border-navy-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-navy">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-right">Points</th>
                  <th className="px-4 py-3 text-right">Sessions</th>
                  <th className="px-4 py-3 text-right">Avg Score</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uniqueUsers.map((email) => {
                  const userSess = sessions.filter((s) => s.email === email);
                  const pts = getPoints(email);
                  const avg = userSess.length > 0
                    ? Math.round(userSess.reduce((a, s) => a + s.score, 0) / userSess.length)
                    : 0;
                  return (
                    <tr key={email} className="border-b border-navy last:border-0">
                      <td className="px-4 py-3">{email}</td>
                      <td className="px-4 py-3 text-right font-mono text-gold">{pts}</td>
                      <td className="px-4 py-3 text-right">{userSess.length}</td>
                      <td className="px-4 py-3 text-right">{avg}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setSelectedUser(email); setTab("sessions"); }}
                          className="text-xs text-blue-400 hover:underline mr-2"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setSelectedUser(email); setTab("manage"); }}
                          className="text-xs text-yellow-400 hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sessions tab */}
      {tab === "sessions" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedUser || "all"}
              onChange={(e) => setSelectedUser(e.target.value === "all" ? null : e.target.value)}
              className="bg-navy border border-navy-surface rounded px-3 py-1.5 text-sm outline-none"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <button onClick={handleExportCSV} className="text-xs px-3 py-1.5 rounded border border-navy-surface text-gray-400 hover:border-gold hover:text-gold">
              Export CSV
            </button>
          </div>

          <div className="bg-navy-surface rounded-lg border border-navy-surface overflow-auto max-h-[500px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-navy-surface">
                <tr className="text-gray-400 uppercase tracking-wider border-b border-navy">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Market</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {userSessions.slice(0, 100).map((s) => (
                  <tr key={s.id} className="border-b border-navy last:border-0">
                    <td className="px-3 py-2">{new Date(s.timestamp).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">{s.mode}</td>
                    <td className="px-3 py-2">{s.market}</td>
                    <td className="px-3 py-2 text-right">{s.score}/100</td>
                    <td className="px-3 py-2 text-right text-gold">+{s.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage tab */}
      {tab === "manage" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(e.target.value || null)}
              className="bg-navy border border-navy-surface rounded px-3 py-1.5 text-sm outline-none"
            >
              <option value="">Select user...</option>
              {uniqueUsers.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="bg-navy-surface rounded-lg p-4 border border-navy-surface space-y-4">
              <h3 className="font-semibold">{selectedUser}</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Set points:</label>
                <input
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-24 bg-navy border border-navy rounded px-2 py-1 text-sm outline-none focus:border-gold"
                  placeholder={getPoints(selectedUser).toString()}
                />
                <button
                  onClick={() => handleSetPoints(selectedUser)}
                  className="text-xs px-3 py-1 rounded bg-gold text-navy font-semibold"
                >
                  Set
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleResetUser(selectedUser)}
                  className="text-xs px-3 py-1.5 rounded border border-red-500/50 text-red-300 hover:bg-red-500/20"
                >
                  Reset All Progress
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-navy-surface pt-4">
            <button
              onClick={handleResetLeaderboard}
              className="text-xs px-3 py-1.5 rounded border border-red-500/50 text-red-300 hover:bg-red-500/20"
            >
              Reset Weekly Leaderboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
