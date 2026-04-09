"use client";
import { useState } from "react";
import { login, register, SessionUser } from "@/lib/auth";

interface Props {
  onLogin: (user: SessionUser) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (mode === "login") {
        const user = login(email, password);
        if (user) { onLogin(user); }
        else { setError("Invalid email or password"); }
      } else {
        const result = register(name, email, password);
        if (result.user) { onLogin(result.user); }
        else { setError(result.error || "Registration failed"); }
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold mb-4 shadow-glow">
            <span className="text-2xl font-bold text-navy">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">
            Synergy Sales Training
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            B2B Sales Simulator
          </p>
        </div>

        {/* Login/Register card */}
        <div className="glass-card rounded-2xl p-6 shadow-card">
          <h2 className="text-base font-semibold text-center text-gray-300 mb-5">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-navy-surface/80 border border-navy-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-gray-600"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === "login"}
                className="w-full bg-navy-surface/80 border border-navy-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-gray-600"
                placeholder="you@synergylub.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-navy-surface/80 border border-navy-border rounded-xl px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-gray-600"
                placeholder="••••••••••"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-gold text-navy-DEFAULT font-bold py-3 rounded-xl text-sm disabled:opacity-50 hover:shadow-glow active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-xs text-gray-500 hover:text-gold transition-colors"
            >
              {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-border">
            <p className="text-[11px] text-gray-600 text-center">
              Synergy Lubricant & Chemical Co., Ltd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
