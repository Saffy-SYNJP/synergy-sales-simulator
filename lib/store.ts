// localStorage persistence layer for Synergy Sales Trainer
// All keys prefixed with "synergy_simulator_"

const PREFIX = "synergy_simulator_";

function key(k: string): string {
  return `${PREFIX}${k}`;
}

function getJSON<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key(k));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON<T>(k: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(k), JSON.stringify(value));
}

// --- User Points ---
export function getPoints(email: string): number {
  return getJSON<number>(`points_${email}`, 0);
}

export function addPoints(email: string, pts: number): number {
  const current = getPoints(email);
  const next = current + pts;
  setJSON(`points_${email}`, next);
  return next;
}

export function setPoints(email: string, pts: number): void {
  setJSON(`points_${email}`, pts);
}

// --- Session History ---
export interface SessionRecord {
  id: string;
  email: string;
  timestamp: number;
  mode: string;
  market: string;
  objection: string;
  score: number;
  pills: {
    objectionHandled: boolean;
    prospectQualified: boolean;
    whiteLabelPitched: boolean;
    visitCloseMade: boolean;
  };
  pointsEarned: number;
  voiceSession: boolean;
}

export function getSessions(email: string): SessionRecord[] {
  return getJSON<SessionRecord[]>(`sessions_${email}`, []);
}

export function getAllSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  const all: SessionRecord[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`${PREFIX}sessions_`)) {
      try {
        const records = JSON.parse(localStorage.getItem(k) || "[]");
        all.push(...records);
      } catch { /* skip */ }
    }
  }
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export function addSession(record: SessionRecord): void {
  const sessions = getSessions(record.email);
  sessions.unshift(record);
  // Keep last 50
  if (sessions.length > 50) sessions.length = 50;
  setJSON(`sessions_${record.email}`, sessions);
}

// --- Call Logs ---
export interface CallLogEntry {
  id: string;
  email: string;
  timestamp: number;
  duration: number; // seconds
  mode: string;
  market: string;
  personaName: string;
  score: number | null;
  transcript: Array<{ role: "user" | "assistant"; text: string }>;
  voiceCall: boolean;
}

export function getCallLogs(email: string): CallLogEntry[] {
  return getJSON<CallLogEntry[]>(`calllogs_${email}`, []);
}

export function getAllCallLogs(): CallLogEntry[] {
  if (typeof window === "undefined") return [];
  const all: CallLogEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`${PREFIX}calllogs_`)) {
      try {
        const records = JSON.parse(localStorage.getItem(k) || "[]");
        all.push(...records);
      } catch { /* skip */ }
    }
  }
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export function addCallLog(entry: CallLogEntry): void {
  const logs = getCallLogs(entry.email);
  logs.unshift(entry);
  if (logs.length > 100) logs.length = 100;
  setJSON(`calllogs_${entry.email}`, logs);
}

// --- Achievements ---
export type BadgeId =
  | "first_blood"
  | "on_fire"
  | "objection_crusher"
  | "market_explorer"
  | "perfect_pitch"
  | "consistent"
  | "elite_closer"
  | "white_label_king"
  | "visit_master";

export interface Badge {
  id: BadgeId;
  icon: string;
  name: string;
  description: string;
}

export const ALL_BADGES: Badge[] = [
  { id: "first_blood", icon: "🎯", name: "First Blood", description: "Complete first session" },
  { id: "on_fire", icon: "🔥", name: "On Fire", description: "3 sessions in one day" },
  { id: "objection_crusher", icon: "💪", name: "Objection Crusher", description: "Handle all 6 objection categories" },
  { id: "market_explorer", icon: "🌏", name: "Market Explorer", description: "Complete all 3 markets" },
  { id: "perfect_pitch", icon: "👑", name: "Perfect Pitch", description: "Score 100/100" },
  { id: "consistent", icon: "📈", name: "Consistent", description: "7-day streak" },
  { id: "elite_closer", icon: "🏆", name: "Elite Closer", description: "Reach Level 5" },
  { id: "white_label_king", icon: "💰", name: "White Label King", description: "Pitch white-label 10 times" },
  { id: "visit_master", icon: "🤝", name: "Visit Master", description: "Close with visit offer 20 times" },
];

export function getUnlockedBadges(email: string): BadgeId[] {
  return getJSON<BadgeId[]>(`badges_${email}`, []);
}

export function unlockBadge(email: string, badge: BadgeId): boolean {
  const unlocked = getUnlockedBadges(email);
  if (unlocked.includes(badge)) return false;
  unlocked.push(badge);
  setJSON(`badges_${email}`, unlocked);
  return true;
}

// --- Streak Tracking ---
export function getStreak(email: string): { current: number; lastDate: string } {
  return getJSON(`streak_${email}`, { current: 0, lastDate: "" });
}

export function updateStreak(email: string): number {
  const today = new Date().toISOString().split("T")[0];
  const streak = getStreak(email);

  if (streak.lastDate === today) return streak.current;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (streak.lastDate === yesterdayStr) {
    const next = { current: streak.current + 1, lastDate: today };
    setJSON(`streak_${email}`, next);
    return next.current;
  }

  const reset = { current: 1, lastDate: today };
  setJSON(`streak_${email}`, reset);
  return 1;
}

// --- Leaderboard ---
export interface LeaderboardEntry {
  email: string;
  name: string;
  points: number;
  level: number;
  levelName: string;
  levelIcon: string;
  sessionsCompleted: number;
  winRate: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return getJSON<LeaderboardEntry[]>("leaderboard", []);
}

export function updateLeaderboard(entry: LeaderboardEntry): void {
  const board = getLeaderboard();
  const idx = board.findIndex((e) => e.email === entry.email);
  if (idx >= 0) {
    board[idx] = entry;
  } else {
    board.push(entry);
  }
  board.sort((a, b) => b.points - a.points);
  setJSON("leaderboard", board);
}

// --- Admin: reset weekly leaderboard ---
export function resetLeaderboard(): void {
  setJSON("leaderboard", []);
}

// --- Admin: manage user credentials ---
export function getCustomUsers(): Array<{ email: string; password: string; name: string; market: string }> {
  return getJSON("custom_users", []);
}

export function addCustomUser(user: { email: string; password: string; name: string; market: string }): void {
  const users = getCustomUsers();
  users.push(user);
  setJSON("custom_users", users);
}
