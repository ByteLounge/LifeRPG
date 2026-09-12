"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, User } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { soundEngine } from "@/lib/sound";

export default function SignupPage() {
  const router = useRouter();
  const { refreshGameData } = useGame();

  const [displayName, setDisplayName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCoin();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          characterName: characterName || displayName,
          email,
          password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        soundEngine.playPowerDown();
        setError(json.error?.message || "Registration failed. Please try again.");
        return;
      }

      soundEngine.playLevelUp();
      await refreshGameData();
      router.push("/onboarding");
    } catch {
      soundEngine.playPowerDown();
      setError("Network failure. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md pixel-box p-8 bg-[#181824] border-2 border-yellow-400 shadow-[6px_6px_0px_#eab308]">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex w-14 h-14 pixel-box-mario items-center justify-center text-3xl mb-1 shadow-md">
            🍄
          </div>
          <div className="font-pixel text-[10px] text-yellow-400 tracking-wider">
            ★ NEW ACCOUNT ★
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-white tracking-wide">
            CREATE YOUR ACCOUNT
          </h2>
          <p className="font-retro text-xs text-slate-400">
            Start turning your daily habits and goals into a game!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 pixel-box bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-retro flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider mb-2">
              YOUR FULL NAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (!characterName) setCharacterName(e.target.value);
                }}
                placeholder="e.g. Alex Parker"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider mb-2">
              CHARACTER NICKNAME
            </label>
            <div className="relative">
              <span className="text-sm absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">⭐</span>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. Alex the Brave"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
              />
            </div>
          </div>

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
            <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider mb-2">
              PASSWORD (MIN 8 CHARACTERS)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="text-center font-retro text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
