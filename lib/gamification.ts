import { SummaryData } from "@/components/SessionSummary";
import {
  addPoints,
  getPoints,
  addSession,
  getSessions,
  updateStreak,
  unlockBadge,
  getUnlockedBadges,
  updateLeaderboard,
  SessionRecord,
  BadgeId,
} from "./store";

// --- Levels ---
export interface Level {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  maxPoints: number;
  message: string;
}

export const LEVELS: Level[] = [
  { level: 1, name: "Recruit", icon: "🔰", minPoints: 0, maxPoints: 199, message: "Welcome to Synergy. Your training begins now." },
  { level: 2, name: "Caller", icon: "📞", minPoints: 200, maxPoints: 499, message: "You're making calls. Keep sharpening your pitch." },
  { level: 3, name: "Closer", icon: "🎯", minPoints: 500, maxPoints: 999, message: "You're closing deals. Prospects respect you." },
  { level: 4, name: "Dealer", icon: "💼", minPoints: 1000, maxPoints: 1999, message: "Top-tier performer. You're building real business." },
  { level: 5, name: "Elite", icon: "⭐", minPoints: 2000, maxPoints: Infinity, message: "Elite status. You are the standard others train against." },
];

export function getLevelForPoints(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getProgressToNextLevel(points: number): { current: number; needed: number; percent: number } {
  const level = getLevelForPoints(points);
  if (level.level === 5) return { current: points - level.minPoints, needed: 0, percent: 100 };
  const nextLevel = LEVELS[level.level]; // 0-indexed + 1 = next
  const needed = nextLevel.minPoints - level.minPoints;
  const current = points - level.minPoints;
  return { current, needed, percent: Math.min(100, Math.round((current / needed) * 100)) };
}

// --- Points Calculation ---
export interface PointsBreakdown {
  sessionComplete: number;
  objectionHandled: number;
  prospectQualified: number;
  whiteLabelPitched: number;
  visitCloseMade: number;
  scoreBonus: number;
  perfectSession: number;
  streakBonus: number;
  marketMastery: number;
  voiceMultiplier: number;
  total: number;
}

export function calculatePoints(
  summary: SummaryData,
  email: string,
  market: string,
  voiceSession: boolean
): PointsBreakdown {
  const pills = summary.pills;
  const score = summary.overallScore;

  let sessionComplete = 10;
  let objectionHandled = pills.objectionHandled ? 15 : 0;
  let prospectQualified = pills.prospectQualified ? 15 : 0;
  let whiteLabelPitched = pills.whiteLabelPitched ? 20 : 0;
  let visitCloseMade = pills.visitCloseMade ? 25 : 0;

  let scoreBonus = 0;
  if (score === 100) scoreBonus = 75;
  else if (score >= 85) scoreBonus = 40;
  else if (score >= 70) scoreBonus = 20;

  const allPills = pills.objectionHandled && pills.prospectQualified && pills.whiteLabelPitched && pills.visitCloseMade;
  let perfectSession = allPills ? 50 : 0;

  // Streak bonus
  const streak = updateStreak(email);
  let streakBonus = streak >= 3 && streak % 3 === 0 ? 30 : 0;

  // Market mastery: check if all 3 markets completed
  const sessions = getSessions(email);
  const markets = new Set(sessions.map((s) => s.market));
  markets.add(market);
  let marketMastery = 0;
  if (markets.has("philippines") && markets.has("vietnam") && markets.has("india")) {
    const prev = sessions.some((s) => {
      const prevMarkets = new Set(sessions.filter((ss) => ss.timestamp <= s.timestamp).map((ss) => ss.market));
      return prevMarkets.has("philippines") && prevMarkets.has("vietnam") && prevMarkets.has("india");
    });
    if (!prev) marketMastery = 100;
  }

  let subtotal = sessionComplete + objectionHandled + prospectQualified + whiteLabelPitched + visitCloseMade + scoreBonus + perfectSession + streakBonus + marketMastery;
  let voiceMultiplier = 0;
  if (voiceSession) {
    voiceMultiplier = Math.round(subtotal * 0.5);
    subtotal += voiceMultiplier;
  }

  return {
    sessionComplete,
    objectionHandled,
    prospectQualified,
    whiteLabelPitched,
    visitCloseMade,
    scoreBonus,
    perfectSession,
    streakBonus,
    marketMastery,
    voiceMultiplier,
    total: subtotal,
  };
}

// --- Record session + check badges + update leaderboard ---
export function recordSession(
  email: string,
  name: string,
  mode: string,
  market: string,
  objection: string,
  summary: SummaryData,
  voiceSession: boolean
): { points: PointsBreakdown; newBadges: BadgeId[]; leveledUp: boolean; oldLevel: number; newLevel: number } {
  const oldPoints = getPoints(email);
  const oldLevel = getLevelForPoints(oldPoints).level;
  const points = calculatePoints(summary, email, market, voiceSession);

  addPoints(email, points.total);
  const newPoints = getPoints(email);
  const newLevel = getLevelForPoints(newPoints).level;
  const leveledUp = newLevel > oldLevel;

  const record: SessionRecord = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    timestamp: Date.now(),
    mode,
    market,
    objection,
    score: summary.overallScore,
    pills: summary.pills,
    pointsEarned: points.total,
    voiceSession,
  };
  addSession(record);

  // Check badges
  const newBadges: BadgeId[] = [];
  const sessions = getSessions(email);
  const unlocked = getUnlockedBadges(email);

  // First Blood
  if (!unlocked.includes("first_blood") && sessions.length >= 1) {
    if (unlockBadge(email, "first_blood")) newBadges.push("first_blood");
  }

  // On Fire — 3 sessions same day
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => new Date(s.timestamp).toISOString().split("T")[0] === today);
  if (!unlocked.includes("on_fire") && todaySessions.length >= 3) {
    if (unlockBadge(email, "on_fire")) newBadges.push("on_fire");
  }

  // Objection Crusher — all 6 categories
  // Check if user has handled objections from all categories across sessions
  if (!unlocked.includes("objection_crusher")) {
    const handledCategories = new Set<string>();
    sessions.forEach((s) => {
      if (s.pills.objectionHandled && s.objection) {
        handledCategories.add(s.objection);
      }
    });
    if (handledCategories.size >= 6) {
      if (unlockBadge(email, "objection_crusher")) newBadges.push("objection_crusher");
    }
  }

  // Market Explorer — all 3 markets
  const allMarkets = new Set(sessions.map((s) => s.market));
  if (!unlocked.includes("market_explorer") && allMarkets.has("philippines") && allMarkets.has("vietnam") && allMarkets.has("india")) {
    if (unlockBadge(email, "market_explorer")) newBadges.push("market_explorer");
  }

  // Perfect Pitch
  if (!unlocked.includes("perfect_pitch") && summary.overallScore === 100) {
    if (unlockBadge(email, "perfect_pitch")) newBadges.push("perfect_pitch");
  }

  // Consistent — 7 day streak
  const { current: streak } = { current: updateStreak(email) };
  if (!unlocked.includes("consistent") && streak >= 7) {
    if (unlockBadge(email, "consistent")) newBadges.push("consistent");
  }

  // Elite Closer
  if (!unlocked.includes("elite_closer") && newLevel >= 5) {
    if (unlockBadge(email, "elite_closer")) newBadges.push("elite_closer");
  }

  // White Label King — 10 white-label pitches
  const wlCount = sessions.filter((s) => s.pills.whiteLabelPitched).length;
  if (!unlocked.includes("white_label_king") && wlCount >= 10) {
    if (unlockBadge(email, "white_label_king")) newBadges.push("white_label_king");
  }

  // Visit Master — 20 visit closes
  const visitCount = sessions.filter((s) => s.pills.visitCloseMade).length;
  if (!unlocked.includes("visit_master") && visitCount >= 20) {
    if (unlockBadge(email, "visit_master")) newBadges.push("visit_master");
  }

  // Update leaderboard
  const wins = sessions.filter((s) => s.score >= 70).length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;
  const lvl = getLevelForPoints(newPoints);
  updateLeaderboard({
    email,
    name,
    points: newPoints,
    level: lvl.level,
    levelName: lvl.name,
    levelIcon: lvl.icon,
    sessionsCompleted: sessions.length,
    winRate,
  });

  return { points, newBadges, leveledUp, oldLevel, newLevel };
}

// --- Stats for Progress Dashboard ---
export interface UserStats {
  totalPoints: number;
  level: Level;
  progress: { current: number; needed: number; percent: number };
  sessionsToday: number;
  sessionsWeek: number;
  sessionsTotal: number;
  winRate: number;
  strongestMarket: string;
  weakestMarket: string;
  currentStreak: number;
  badgesUnlocked: string[];
}

export function getUserStats(email: string): UserStats {
  const points = getPoints(email);
  const level = getLevelForPoints(points);
  const progress = getProgressToNextLevel(points);
  const sessions = getSessions(email);
  const badges = getUnlockedBadges(email);
  const currentStreak = sessions.length > 0 ? updateStreak(email) : 0;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessionsToday = sessions.filter((s) => new Date(s.timestamp).toISOString().split("T")[0] === todayStr).length;
  const sessionsWeek = sessions.filter((s) => s.timestamp > weekAgo.getTime()).length;
  const wins = sessions.filter((s) => s.score >= 70).length;
  const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;

  // Market strength
  const marketScores: Record<string, number[]> = {};
  sessions.forEach((s) => {
    if (!marketScores[s.market]) marketScores[s.market] = [];
    marketScores[s.market].push(s.score);
  });
  let strongestMarket = "—";
  let weakestMarket = "—";
  let bestAvg = -1;
  let worstAvg = 101;
  for (const [m, scores] of Object.entries(marketScores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestAvg) { bestAvg = avg; strongestMarket = m; }
    if (avg < worstAvg) { worstAvg = avg; weakestMarket = m; }
  }

  return {
    totalPoints: points,
    level,
    progress,
    sessionsToday,
    sessionsWeek,
    sessionsTotal: sessions.length,
    winRate,
    strongestMarket,
    weakestMarket,
    currentStreak: sessions.length > 0 ? updateStreak(email) : 0,
    badgesUnlocked: badges,
  };
}
