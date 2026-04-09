"use client";
import { useEffect, useState } from "react";
import { getSession, logout, SessionUser, isAdmin as checkAdmin } from "@/lib/auth";
import { getMarketsForRole, MarketId, Market } from "@/lib/markets";
import { getLevelForPoints, getProgressToNextLevel } from "@/lib/gamification";
import { getPoints } from "@/lib/store";
import LoginPage from "@/components/LoginPage";
import ModeSelector from "@/components/ModeSelector";
import MarketSelector from "@/components/MarketSelector";
import ObjectionPicker, { ObjectionSelection } from "@/components/ObjectionPicker";
import ChatPanel from "@/components/ChatPanel";
import Leaderboard from "@/components/Leaderboard";
import ProgressDashboard from "@/components/ProgressDashboard";
import AdminPanel from "@/components/AdminPanel";
import LevelUpModal from "@/components/LevelUpModal";
import { Mode } from "@/lib/prompts";

type View = "training" | "progress" | "leaderboard" | "admin";

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("training");
  const [mode, setMode] = useState<Mode>("prospect");
  const [marketId, setMarketId] = useState<MarketId | null>(null);
  const [objection, setObjection] = useState<ObjectionSelection>({ kind: "none" });
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [points, setPoints] = useState(0);

  // Check session on mount
  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      setPoints(getPoints(session.email));
    }
    setLoading(false);
  }, []);

  const refreshPoints = () => {
    if (user) setPoints(getPoints(user.email));
  };

  const handleLogin = (u: SessionUser) => {
    setUser(u);
    setPoints(getPoints(u.email));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView("training");
  };

  const handleSessionEnd = (result: { leveledUp: boolean; newLevel: number }) => {
    refreshPoints();
    if (result.leveledUp) {
      setLevelUpModal(result.newLevel);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const admin = checkAdmin(user);
  const markets = getMarketsForRole(admin ? "admin" : "freelancer");
  const level = getLevelForPoints(points);
  const progress = getProgressToNextLevel(points);

  const NAV: { id: View; label: string; icon: string; adminOnly?: boolean }[] = [
    { id: "training", label: "Training", icon: "🎯" },
    { id: "progress", label: "Progress", icon: "📊" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "admin", label: "Admin", icon: "⚙️", adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Level Up Modal */}
      {levelUpModal && (
        <LevelUpModal
          newLevel={levelUpModal}
          onClose={() => setLevelUpModal(null)}
        />
      )}

      {/* Header */}
      <header className="border-b border-navy-surface flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gold">Synergy Sales Training</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Level badge + points */}
            <div className="hidden md:flex items-center gap-2 bg-navy-surface rounded-full px-3 py-1.5">
              <span className="text-sm">{level.icon}</span>
              <span className="text-xs font-semibold">{level.name}</span>
              <span className="text-xs text-gold font-mono">{points.toLocaleString()} pts</span>
              {progress.percent < 100 && (
                <div className="w-16 h-1.5 bg-navy rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${progress.percent}%` }} />
                </div>
              )}
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{user.name}</span>
              {admin && <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded">Admin</span>}
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 px-2 py-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="border-b border-navy-surface flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {NAV.filter((n) => !n.adminOnly || admin).map((n) => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); refreshPoints(); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                view === n.id
                  ? "border-gold text-gold"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {view === "training" && (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-160px)]">
            {/* Setup sidebar */}
            <aside className="space-y-4 overflow-y-auto pr-1">
              {/* Level mini-card */}
              <div className="bg-navy-surface rounded-lg p-3 border border-navy-surface flex items-center gap-3 md:hidden">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <div className="text-sm font-semibold">Lv.{level.level} {level.name}</div>
                  <div className="text-xs text-gold">{points.toLocaleString()} pts</div>
                </div>
              </div>

              <section>
                <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">1. Mode</h2>
                <ModeSelector value={mode} onChange={setMode} />
              </section>

              {mode !== "coach" && (
                <section>
                  <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">2. Market</h2>
                  <MarketSelector value={marketId} onChange={setMarketId} markets={markets} />
                </section>
              )}

              {mode === "prospect" && (
                <section>
                  <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">3. Objection (optional)</h2>
                  <ObjectionPicker value={objection} onChange={setObjection} />
                </section>
              )}
            </aside>

            {/* Chat */}
            <section className="min-h-0">
              <ChatPanel
                mode={mode}
                marketId={marketId}
                objection={objection}
                userEmail={user.email}
                userName={user.name}
                onSessionEnd={handleSessionEnd}
              />
            </section>
          </div>
        )}

        {view === "progress" && (
          <ProgressDashboard email={user.email} />
        )}

        {view === "leaderboard" && (
          <Leaderboard currentUserEmail={user.email} isAdmin={admin} />
        )}

        {view === "admin" && admin && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}
