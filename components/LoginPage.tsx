"use client";
import { useState } from "react";
import { login, SessionUser } from "@/lib/auth";

interface Props {
  onLogin: (user: SessionUser) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const user = login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2">
            Synergy Sales Training
          </h1>
          <p className="text-sm text-gray-400">
            EcoMatic · B2B Sales Simulator · Hormozi Framework
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-surface rounded-xl p-6 space-y-4 border border-navy-surface"
        >
          <h2 className="text-lg font-semibold text-center">Sign In</h2>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-navy border border-navy rounded px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="you@synergylub.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-navy border border-navy rounded px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-navy font-semibold py-2.5 rounded text-sm disabled:opacity-50 hover:bg-gold/90 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Synergy Lubricant & Chemical Co., Ltd.
          </p>
        </form>
      </div>
    </div>
  );
}
