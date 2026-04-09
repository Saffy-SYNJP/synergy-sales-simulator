"use client";
import { useEffect, useState } from "react";
import { getSession, logout, SessionUser, isAdmin as checkAdmin } from "@/lib/auth";
import { getMarketsForRole, MarketId, Market } from "@/lib/markets";
import { getLevelForPoints, getProgressToNextLevel } from "@/lib/gamification";
import { getPoints } from "@/lib/store";
import { Theme, initTheme, setStoredTheme } from "@/lib/theme";
import LoginPage from "@/components/LoginPage";
import ModeSelector from "@/components/ModeSelector";
import MarketSelector from "@/components/MarketSelector";
import ObjectionPicker, { ObjectionSelection } from "@/components/ObjectionPicker";
import ChatPanel from "@/components/ChatPanel";
import Leaderboard from "@/components/Leaderboard";
import ProgressDashboard from "@/components/ProgressDashboard";
import AdminPanel from "@/components/AdminPanel";
import CallLogs from "@/components/CallLogs";
import LevelUpModal from "@/components/LevelUpModal";
import { Mode } from "@/lib/prompts";

type View = "training" | "progress" | "calls" | "leaderboard" | "admin";

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("training");
  const [mode, setMode] = useState<Mode>("prospect");
  const [marketId, setMarketId] = useState<MarketId | null>(null);
  const [objection, setObjection] = useState<ObjectionSelection>({ kind: "none" });
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = initTheme();
    setTheme(t);
    const session = getSession();
    setUser(session);
    if (session) setPoints(getPoints(session.email));
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setStoredTheme(next);
  };

  const refreshPoints = () => { if (user) setPoints(getPoints(user.email)); };
  const handleLogin = (u: SessionUser) => { setUser(u); setPoints(getPoints(u.email)); };
  const handleLogout = () => { logout(); setUser(null); setView("training"); };
  const handleSessionEnd = (result: { leveledUp: boolean; newLevel: number }) => {
    refreshPoints();
    if (result.leveledUp) setLevelUpModal(result.newLevel);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-DEFAULT">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const admin = checkAdmin(user);
  const markets = getMarketsForRole(admin ? "admin" : "freelancer");
  const level = getLevelForPoints(points);
  const progress = getProgressToNextLevel(points);

  const NAV: { id: View; label: string; icon: string; adminOnly?: boolean }[] = [
    { id: "training", label: "Training", icon: "🎯" },
    { id: "calls", label: "Call Logs", icon: "📞" },
    { id: "progress", label: "Progress", icon: "📊" },
    { id: "leaderboard", label: "Board", icon: "🏆" },
    { id: "admin", label: "Admin", icon: "⚙️", adminOnly: true },
  ];

  const guideUrl = "/guide";

  return (
    <div className="min-h-screen bg-navy-DEFAULT flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yt-red/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-blue/[0.03] rounded-full blur-3xl" />
      </div>

      {levelUpModal && <LevelUpModal newLevel={levelUpModal} onClose={() => setLevelUpModal(null)} />}

      {/* Header */}
      <header className="relative z-10 border-b border-navy-border/50 flex-shrink-0 backdrop-blur-sm bg-navy-DEFAULT/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Logo + brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0 shadow-glow-sm">
              <span className="text-navy-DEFAULT font-black text-sm sm:text-base">S</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gradient-gold truncate">Synergy Sales</h1>
              <div className="text-[9px] sm:text-[10px] text-gray-600 tracking-wider uppercase hidden xs:block">Training Engine</div>
            </div>
          </div>

          {/* Level badge + points (desktop) */}
          <div className="hidden md:flex items-center gap-2.5 glass-card rounded-full px-4 py-2">
            <span className="text-lg">{level.icon}</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-gray-300">Lv.{level.level} {level.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gold font-mono font-semibold">{points.toLocaleString()} pts</span>
                {progress.percent < 100 && (
                  <div className="w-16 h-1 bg-navy-surface rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-gold rounded-full transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.name}</span>
              {admin && (
                <span className="text-[9px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-md font-semibold border border-gold/20">
                  Admin
                </span>
              )}
            </div>
            <a
              href={guideUrl}
              target="_blank"
              className="text-[11px] px-2 py-1 rounded-lg hover:bg-navy-hover transition-all"
              style={{ color: "var(--text-muted)" }}
            >
              Guide
            </a>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-navy-hover transition-all"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleLogout}
              className="text-[11px] px-2 py-1 rounded-lg hover:bg-accent-red/10 transition-all"
              style={{ color: "var(--text-muted)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-navy-border/50 flex-shrink-0 backdrop-blur-sm bg-navy-DEFAULT/60">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex">
          {NAV.filter((n) => !n.adminOnly || admin).map((n) => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); refreshPoints(); }}
              className={`relative px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all ${
                view === n.id
                  ? "text-gold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="sm:hidden">{n.icon}</span>
              <span className="hidden sm:inline">{n.icon} {n.label}</span>
              {view === n.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-gold rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile level bar */}
      <div className="md:hidden border-b border-navy-border/30 bg-navy-DEFAULT/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{level.icon}</span>
            <span className="text-[11px] font-semibold text-gray-300">Lv.{level.level} {level.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gold font-mono font-semibold">{points.toLocaleString()} pts</span>
            {progress.percent < 100 && (
              <div className="w-12 h-1 bg-navy-surface rounded-full overflow-hidden">
                <div className="h-full bg-gradient-gold rounded-full" style={{ width: `${progress.percent}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6">
        {view === "training" && (
          <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-3 sm:gap-4 h-[calc(100vh-180px)] sm:h-[calc(100vh-160px)]">
            {/* Mobile toggle for setup */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden glass-card rounded-xl px-4 py-2.5 flex items-center justify-between text-sm"
            >
              <span className="text-gray-400">
                <span className="text-gold font-semibold">{mode === "prospect" ? "🎯 Prospect" : mode === "demo" ? "👁 Watch AI" : "🧠 Coach"}</span>
                {marketId && <span className="text-gray-600 mx-1.5">·</span>}
                {marketId && <span className="text-gray-500 capitalize">{marketId}</span>}
              </span>
              <span className={`text-gray-600 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {/* Setup sidebar */}
            <aside className={`space-y-3 sm:space-y-4 overflow-y-auto lg:block ${sidebarOpen ? "block" : "hidden lg:block"}`}>
              <section>
                <h2 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">1. Training Mode</h2>
                <ModeSelector value={mode} onChange={(m) => { setMode(m); setSidebarOpen(false); }} />
              </section>

              {mode !== "coach" && (
                <section>
                  <h2 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">2. Target Market</h2>
                  <MarketSelector value={marketId} onChange={setMarketId} markets={markets} />
                </section>
              )}

              {mode === "prospect" && (
                <section>
                  <h2 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">3. Objection (optional)</h2>
                  <ObjectionPicker value={objection} onChange={setObjection} />
                </section>
              )}
            </aside>

            {/* Chat */}
            <section className="min-h-0 flex-1">
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

        {view === "calls" && <CallLogs email={user.email} />}
        {view === "progress" && <ProgressDashboard email={user.email} />}
        {view === "leaderboard" && <Leaderboard currentUserEmail={user.email} isAdmin={admin} />}
        {view === "admin" && admin && <AdminPanel />}
      </main>
    </div>
  );
}
