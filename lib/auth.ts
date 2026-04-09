export type UserRole = "freelancer" | "admin";

export interface User {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  market: string; // primary market
  allowedMarkets: string[]; // markets this user can access
}

export const USERS: User[] = [
  {
    email: "jan@synergylub.com",
    password: "Synergy2026",
    name: "Jan",
    role: "freelancer",
    market: "philippines",
    allowedMarkets: ["philippines", "vietnam", "india"],
  },
  {
    email: "ted@synergylub.com",
    password: "Synergy2026",
    name: "Ted",
    role: "freelancer",
    market: "myanmar",
    allowedMarkets: ["philippines", "vietnam", "india"],
  },
  {
    email: "saffy@synergylub.com",
    password: "SynergyAdmin2026",
    name: "Saffy",
    role: "admin",
    market: "all",
    allowedMarkets: ["philippines", "vietnam", "india", "myanmar"],
  },
];

export interface SessionUser {
  email: string;
  name: string;
  role: UserRole;
  market: string;
  allowedMarkets: string[];
}

const SESSION_KEY = "synergy_simulator_session";

export function login(email: string, password: string): SessionUser | null {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return null;
  const session: SessionUser = {
    email: user.email,
    name: user.name,
    role: user.role,
    market: user.market,
    allowedMarkets: user.allowedMarkets,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin";
}
