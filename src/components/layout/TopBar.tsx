"use client";

import React from "react";
import { useGame } from "@/components/providers/GameProvider";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

export function TopBar() {
  const { character, streak, xpProgress, soundEnabled, setSoundEnabled } = useGame();

  if (!character) return null;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) soundEngine.playCoin();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#000000] border-b-4 border-[#000000] text-white px-4 md:px-8 py-3 shadow-[0_4px_0_0_#202030]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-pixel text-[11px] md:text-xs">
        {/* Player Profile & Level */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[#E52521] uppercase text-[9px] md:text-[10px] tracking-wider">PLAYER</span>
            <span className="text-white font-bold truncate max-w-[120px] md:max-w-[160px]">
              {character.name}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[#5C94FC] uppercase text-[9px] md:text-[10px] tracking-wider">LEVEL</span>
            <span className="text-[#FBD000] font-bold">LVL {character.level}</span>
          </div>
        </div>

        {/* 8-bit Pixel XP Bar */}
        {xpProgress && (
          <div className="flex-1 max-w-xs min-w-[160px] hidden sm:block">
            <div className="flex justify-between text-[9px] text-[#A0A0B0] mb-1 font-retro">
              <span>XP: {xpProgress.currentProgressXP} / {xpProgress.xpNeededForNextLevel}</span>
              <span className="text-[#5C94FC]">{xpProgress.percentage}%</span>
            </div>
            <div className="pixel-bar-container">
              <div className="pixel-bar-fill" style={{ width: `${xpProgress.percentage}%` }} />
            </div>
          </div>
        )}

        {/* HUD: Coins, Streak & Audio */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Coin Counter */}
          <div className="flex items-center gap-1.5 bg-[#202030] px-2.5 py-1.5 border-2 border-black shadow-[0_2px_0_#000]" title="Coins earned from completing tasks">
            <span className="pixel-coin-spin text-base">🪙</span>
            <span className="text-[#FBD000] font-bold tracking-wider">
              {character.gold} Coins
            </span>
          </div>

          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 bg-[#202030] px-2.5 py-1.5 border-2 border-black shadow-[0_2px_0_#000]" title="Current daily streak">
            <span className="text-sm">🔥</span>
            <span className="text-[#E52521] font-bold">
              {streak?.currentStreak || 0}d Streak
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`pixel-btn ${soundEnabled ? "pixel-btn-green" : "pixel-btn-dark"} text-[9px] py-1.5 px-2.5`}
            title="Toggle retro sound effects"
            aria-label="Toggle sound"
          >
            {soundEnabled ? "SOUND ON" : "MUTED"}
          </button>
        </div>
      </div>
    </header>
  );
}
