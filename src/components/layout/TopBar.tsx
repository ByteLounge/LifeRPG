"use client";

import React from "react";
import { Flame, Coins, Volume2, VolumeX, Shield } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { formatNumber } from "@/lib/utils";

export function TopBar() {
  const { character, streak, xpProgress, soundEnabled, setSoundEnabled } = useGame();

  if (!character) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Level & XP Progression */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-md">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-serif font-black text-sm">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <span>LVL {character.level}</span>
        </div>

        {xpProgress && (
          <div className="flex-1 min-w-[120px] max-w-[240px]">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
              <span className="text-sky-400 font-semibold">{xpProgress.currentProgressXP} XP</span>
              <span>{xpProgress.xpNeededForNextLevel} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500 shadow-rpg-glow"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Economy, Streak & Audio Controls */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Streak Flame */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sm font-semibold"
          title={`Current Streak: ${streak?.currentStreak || 0} days | Longest: ${streak?.longestStreak || 0} days`}
        >
          <Flame
            className={`w-4 h-4 ${
              (streak?.currentStreak || 0) > 0
                ? "text-orange-500 fill-orange-500 animate-pulse"
                : "text-slate-500"
            }`}
          />
          <span className={(streak?.currentStreak || 0) > 0 ? "text-orange-400 font-bold" : "text-slate-400"}>
            {streak?.currentStreak || 0}d
          </span>
        </div>

        {/* Gold Treasury */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold text-sm shadow-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>{formatNumber(character.gold)}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
              : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
          }`}
          title={soundEnabled ? "Mute Game Audio" : "Enable Retro RPG Audio"}
          aria-label="Toggle game audio"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
