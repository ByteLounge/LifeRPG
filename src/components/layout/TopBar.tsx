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
        {/* Mario-style Hero Header & Level */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[#E52521] uppercase text-[9px] md:text-[10px] tracking-wider">HERO</span>
            <span className="text-white font-bold truncate max-w-[120px] md:max-w-[160px]">
              {character.name.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[#5C94FC] uppercase text-[9px] md:text-[10px] tracking-wider">STAGE</span>
            <span className="text-[#FBD000] font-bold">LVL {String(character.level).padStart(2, "0")}</span>
          </div>
        </div>

        {/* 8-bit Pixel XP Bar */}
        {xpProgress && (
          <div className="flex-1 max-w-xs min-w-[160px] hidden sm:block">
            <div className="flex justify-between text-[9px] text-[#A0A0B0] mb-1">
              <span>XP {xpProgress.currentProgressXP}/{xpProgress.xpNeededForNextLevel}</span>
              <span className="text-[#5C94FC]">{xpProgress.percentage}%</span>
            </div>
            <div className="pixel-bar-container">
              <div className="pixel-bar-fill" style={{ width: `${xpProgress.percentage}%` }} />
            </div>
          </div>
        )}

        {/* Arcade HUD: Coins, Streak & Audio */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Animated Coin Counter */}
          <div className="flex items-center gap-1.5 bg-[#202030] px-2.5 py-1.5 border-2 border-black shadow-[0_2px_0_#000]">
            <span className="pixel-coin-spin text-base">🪙</span>
            <span className="text-[#FBD000] font-bold tracking-widest">
              x{String(character.gold).padStart(3, "0")}
            </span>
          </div>

          {/* Daily Streak Fireball */}
          <div className="flex items-center gap-1.5 bg-[#202030] px-2.5 py-1.5 border-2 border-black shadow-[0_2px_0_#000]">
            <span className="text-sm">🔥</span>
            <span className="text-[#E52521] font-bold">
              {String(streak?.currentStreak || 0).padStart(2, "0")}D
            </span>
          </div>

          {/* Retro Audio Toggle */}
          <button
            onClick={toggleSound}
            className={`pixel-btn ${soundEnabled ? "pixel-btn-green" : "pixel-btn-dark"} text-[9px] py-1.5 px-2.5`}
            title="Toggle 8-bit Chiptune Audio"
            aria-label="Toggle sound"
          >
            {soundEnabled ? "SFX:ON" : "SFX:OFF"}
          </button>
        </div>
      </div>
    </header>
  );
}
