"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { soundEngine } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const { refreshGameData } = useGame();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCoin();
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
        soundEngine.playPowerDown();
        setError(json.error?.message || "Invalid email or password. Please try again.");
        return;
      }

      soundEngine.playPowerUp();
      await refreshGameData();
      router.push("/dashboard");
    } catch {
      soundEngine.playPowerDown();
      setError("Network failure. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    soundEngine.playCoin();
    setLoading(true);
    setError(null);
    const demoEmail = `hero_mario_${Math.floor(Math.random() * 9000) + 1000}@liferpg.io`;
    const demoPassword = "StrongPassword123!";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword,
          displayName: "Super Mario Hero",
          characterName: "Jumpman the Brave",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      const json = await res.json();
      if (json.success) {
        soundEngine.playLevelUp();
        await refreshGameData();
        router.push("/dashboard");
      } else {
        soundEngine.playPowerDown();
        setError("Failed to generate demo account.");
      }
    } catch {
      soundEngine.playPowerDown();
      setError("Network connection issue during demo generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md pixel-box p-8 bg-[#181824] border-2 border-yellow-400 shadow-[6px_6px_0px_#eab308]">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex w-14 h-14 question-block items-center justify-center font-pixel text-2xl text-yellow-950 mb-1">
            ?
          </div>
          <div className="font-pixel text-[10px] text-yellow-400 tracking-wider">
            ★ LIFE RPG ★
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-white tracking-wide">
            WELCOME BACK
          </h2>
          <p className="font-retro text-xs text-slate-400">
            Log in to continue your streak and check off today&apos;s tasks!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 pixel-box bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-retro flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider mb-2">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
                PASSWORD
              </label>
              <Link
                href="/forgot-password"
                className="font-retro text-xs text-yellow-500 hover:text-yellow-400 hover:underline"
              >
                Forgot password?
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pixel-btn pixel-btn-yellow w-full py-3 text-slate-950 font-pixel text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "LOG IN"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-700" />
          </div>
          <span className="relative px-3 bg-[#181824] font-pixel text-[8px] uppercase tracking-wider text-slate-400">
            OR TEST INSTANTLY
          </span>
        </div>

        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="pixel-btn pixel-btn-green w-full py-2.5 text-white font-pixel text-[9px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>🪙</span>
          <span>1-CLICK DEMO (NO ACCOUNT NEEDED)</span>
        </button>

        <p className="text-center font-retro text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-yellow-400 font-bold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
