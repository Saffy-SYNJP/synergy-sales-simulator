export type UserRole = "freelancer" | "admin";

export interface User {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  market: string; // primary market
  allowedMarkets: string[]; // markets this user can access
}

// Built-in admin account
const ADMIN_USERS: User[] = [
  {
    email: "saffy@synergylub.com",
    password: "SynergyAdmin2026",
    name: "Saffy",
    role: "admin",
    market: "all",
    allowedMarkets: ["philippines", "vietnam", "india", "myanmar"],
  },
];

const CUSTOM_USERS_KEY = "synergy_simulator_custom_users";

function getCustomUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomUsers(users: User[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
  }
}

function getAllUsers(): User[] {
  return [...ADMIN_USERS, ...getCustomUsers()];
}

export interface SessionUser {
  email: string;
  name: string;
  role: UserRole;
  market: string;
  allowedMarkets: string[];
}

const SESSION_KEY = "synergy_simulator_session";

const FREELANCER_MARKETS = ["philippines", "vietnam", "india"];

export function register(name: string, email: string, password: string): { user?: SessionUser; error?: string } {
  const all = getAllUsers();
  if (all.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: "An account with this email already exists" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  if (!name.trim()) {
    return { error: "Name is required" };
  }

  const newUser: User = {
    email: email.toLowerCase().trim(),
    password,
    name: name.trim(),
    role: "freelancer",
    market: "philippines",
    allowedMarkets: FREELANCER_MARKETS,
  };

  const custom = getCustomUsers();
  custom.push(newUser);
  saveCustomUsers(custom);

  const session: SessionUser = {
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    market: newUser.market,
    allowedMarkets: newUser.allowedMarkets,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return { user: session };
}

export function login(email: string, password: string): SessionUser | null {
  const user = getAllUsers().find(
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
