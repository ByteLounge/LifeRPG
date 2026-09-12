"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle, KeyRound, Mail, ArrowRight } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";

export default function LoginPage() {
  const router = useRouter();
  const { refreshGameData } = useGame();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Invalid credentials. Please try again.");
        return;
      }

      await refreshGameData();
      router.push("/dashboard");
    } catch {
      setError("Network failure. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    const demoEmail = `hero_demo_${Math.floor(Math.random() * 9000) + 1000}@liferpg.io`;
    const demoPassword = "StrongPassword123!";

    try {
      // Auto-register a fresh demo hero with starter quests
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword,
          displayName: "Sir Galahad",
          characterName: "Galahad the Steadfast",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      const json = await res.json();
      if (json.success) {
        await refreshGameData();
        router.push("/dashboard");
      } else {
        setError("Failed to generate demo hero.");
      }
    } catch {
      setError("Network failure during demo generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center text-slate-950 font-black mb-3 shadow-rpg-gold">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-2xl font-black font-serif text-white tracking-wide">Enter the Realm</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to resume your quests and heroic streak</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adventurer@liferpg.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-amber-400 hover:underline">
                Lost scroll?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In & Enter"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-[#111827] text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Or Test Instantly
          </span>
        </div>

        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick 1-Click Demo Adventurer</span>
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          No hero profile yet?{" "}
          <Link href="/signup" className="text-amber-400 font-bold hover:underline">
            Register your hero
          </Link>
        </p>
      </div>
    </div>
  );
}
