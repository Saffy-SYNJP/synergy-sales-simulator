"use client";
import { useEffect, useState } from "react";
import { getAllSessions, getLeaderboard, setPoints, resetLeaderboard, SessionRecord, LeaderboardEntry, getPoints } from "@/lib/store";

export default function AdminPanel() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [tab, setTab] = useState<"overview" | "sessions" | "manage">("overview");

  useEffect(() => { setSessions(getAllSessions()); setBoard(getLeaderboard()); }, []);

  const uniqueUsers = Array.from(new Set(sessions.map((s) => s.email)));
  const userSessions = selectedUser ? sessions.filter((s) => s.email === selectedUser) : sessions;

  const handleSetPoints = (email: string) => {
    const pts = parseInt(pointsInput);
    if (isNaN(pts)) return;
    setPoints(email, pts); setBoard(getLeaderboard()); setPointsInput("");
  };

  const handleResetUser = (email: string) => {
    if (!confirm(`Reset ALL data for ${email}?`)) return;
    setPoints(email, 0);
    localStorage.removeItem(`synergy_simulator_sessions_${email}`);
    localStorage.removeItem(`synergy_simulator_badges_${email}`);
    localStorage.removeItem(`synergy_simulator_streak_${email}`);
    setSessions(getAllSessions()); setBoard(getLeaderboard());
  };

  const handleExportCSV = () => {
    const header = "Date,Email,Mode,Market,Score,Points\n";
    const rows = sessions.map((s) => `${new Date(s.timestamp).toISOString()},${s.email},${s.mode},${s.market},${s.score},${s.pointsEarned}`);
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `synergy-sessions-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gradient-gold">Admin Panel</h2>
        <div className="flex gap-1.5">
          {(["overview", "sessions", "manage"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-[11px] rounded-lg border font-medium transition-all ${
                tab === t ? "border-gold/40 text-gold bg-gold/10" : "border-navy-border text-gray-500 hover:border-gray-600"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Users", value: uniqueUsers.length },
              { label: "Sessions", value: sessions.length },
              { label: "Avg Score", value: sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : "—" },
              { label: "Win Rate", value: sessions.length > 0 ? `${Math.round((sessions.filter((s) => s.score >= 70).length / sessions.length) * 100)}%` : "0%" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-3">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-bold mt-1">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-navy-border">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Sessions</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Avg</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueUsers.map((email) => {
                    const userSess = sessions.filter((s) => s.email === email);
                    const pts = getPoints(email);
                    const avg = userSess.length > 0 ? Math.round(userSess.reduce((a, s) => a + s.score, 0) / userSess.length) : 0;
                    return (
                      <tr key={email} className="border-b border-navy-border/50 last:border-0">
                        <td className="px-4 py-3 text-xs">{email}</td>
                        <td className="px-4 py-3 text-right font-mono text-gold">{pts}</td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">{userSess.length}</td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">{avg}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => { setSelectedUser(email); setTab("sessions"); }} className="text-[11px] text-accent-blue hover:underline">View</button>
                          <button onClick={() => { setSelectedUser(email); setTab("manage"); }} className="text-[11px] text-gold hover:underline">Manage</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "sessions" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select value={selectedUser || "all"} onChange={(e) => setSelectedUser(e.target.value === "all" ? null : e.target.value)}
              className="bg-navy-surface border border-navy-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-gold">
              <option value="all">All Users</option>
              {uniqueUsers.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={handleExportCSV} className="text-[11px] px-3 py-1.5 rounded-lg border border-navy-border text-gray-500 hover:border-gold hover:text-gold transition-all">
              Export CSV
            </button>
          </div>
          <div className="glass-card rounded-2xl overflow-auto max-h-[500px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-navy-card">
                <tr className="text-gray-500 uppercase tracking-wider border-b border-navy-border">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Mode</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Market</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {userSessions.slice(0, 100).map((s) => (
                  <tr key={s.id} className="border-b border-navy-border/50 last:border-0">
                    <td className="px-3 py-2 text-gray-400">{new Date(s.timestamp).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{s.email.split("@")[0]}</td>
                    <td className="px-3 py-2 hidden sm:table-cell text-gray-400">{s.mode}</td>
                    <td className="px-3 py-2 hidden sm:table-cell text-gray-400">{s.market}</td>
                    <td className="px-3 py-2 text-right">{s.score}</td>
                    <td className="px-3 py-2 text-right text-gold">+{s.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "manage" && (
        <div className="space-y-4">
          <select value={selectedUser || ""} onChange={(e) => setSelectedUser(e.target.value || null)}
            className="bg-navy-surface border border-navy-border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold w-full sm:w-auto">
            <option value="">Select user...</option>
            {uniqueUsers.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          {selectedUser && (
            <div className="glass-card rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold text-sm">{selectedUser}</h3>
              <div className="flex items-center gap-2">
                <input type="number" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)}
                  className="w-24 bg-navy-surface border border-navy-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-gold"
                  placeholder={getPoints(selectedUser).toString()} />
                <button onClick={() => handleSetPoints(selectedUser)} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-gold text-navy font-semibold">Set Points</button>
              </div>
              <button onClick={() => handleResetUser(selectedUser)} className="text-xs px-3 py-1.5 rounded-lg border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition-all">
                Reset All Progress
              </button>
            </div>
          )}

          <div className="border-t border-navy-border pt-4">
            <button onClick={() => { if (confirm("Reset leaderboard?")) { resetLeaderboard(); setBoard([]); } }}
              className="text-xs px-3 py-1.5 rounded-lg border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition-all">
              Reset Weekly Leaderboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
