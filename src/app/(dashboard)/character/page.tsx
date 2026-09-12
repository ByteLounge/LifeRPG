"use client";

import React from "react";
import {
  Shield,
  Flame,
  Coins,
  Sparkles,
  BookOpen,
  Dumbbell,
  Palette,
  Heart,
  Users,
  Award,
  Crown,
  Volume2,
} from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { getAttributeLevelFromXP } from "@/lib/game-engine/progression";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

const ATTR_METADATA: Record<
  string,
  { label: string; marioName: string; icon: string; color: string; barColor: string; desc: string }
> = {
  INTELLECT: {
    label: "Intellect",
    marioName: "BRAIN POWER",
    icon: "🧠",
    color: "text-blue-400",
    barColor: "bg-blue-500",
    desc: "Study, coding logic, and mental trials",
  },
  STRENGTH: {
    label: "Strength",
    marioName: "JUMP ATTACK",
    icon: "💥",
    color: "text-red-400",
    barColor: "bg-red-500",
    desc: "Physical fitness, workouts & stamina",
  },
  DISCIPLINE: {
    label: "Discipline",
    marioName: "FIRE FLOW",
    icon: "🔥",
    color: "text-amber-400",
    barColor: "bg-amber-500",
    desc: "Unbroken routines, early rising & habit fire",
  },
  CREATIVITY: {
    label: "Creativity",
    marioName: "STAR SPARK",
    icon: "🎨",
    color: "text-pink-400",
    barColor: "bg-pink-500",
    desc: "Design, writing, art & creative craft",
  },
  VITALITY: {
    label: "Vitality",
    marioName: "MAX HP",
    icon: "❤️",
    color: "text-emerald-400",
    barColor: "bg-emerald-500",
    desc: "Hydration, sleep, nutrition & recovery",
  },
  SOCIAL: {
    label: "Social",
    marioName: "BROS BOND",
    icon: "🤝",
    color: "text-orange-400",
    barColor: "bg-orange-500",
    desc: "Mentoring, community & multiplayer harmony",
  },
};

export default function CharacterPage() {
  const { character, profile, attributes, streak, xpProgress } = useGame();

  if (!character) return null;

  const handleHeroJump = () => {
    soundEngine.playJump();
  };

  const handlePowerUpAudio = () => {
    soundEngine.playPowerUp();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 2D Mario RPG Header Banner */}
      <div className="pixel-box-mario p-4 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-yellow-300 bg-red-950/60 px-2 py-0.5 border border-yellow-400">
              WORLD 1-STATUS
            </span>
            <span className="font-pixel text-[10px] text-yellow-200">★ HERO ATTRIBUTES</span>
          </div>
          <h1 className="font-pixel text-base sm:text-xl text-yellow-300 tracking-wider">
            MARIO RPG STATUS SHEET
          </h1>
          <p className="font-retro text-xs text-red-100 mt-1">
            Real-world discipline calibrated into 8-bit hero power levels!
          </p>
        </div>

        <button
          onClick={handleHeroJump}
          className="pixel-btn pixel-btn-yellow font-pixel text-[10px] px-3 py-2 shrink-0 flex items-center gap-1.5"
        >
          <span>JUMP!</span>
          <span>⬆️</span>
        </button>
      </div>

      {/* Hero Avatar & Identity Card */}
      <div className="pixel-box p-6 md:p-8 bg-[#181824] space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Chunky Pixel Frame */}
          <div className="relative shrink-0 text-center">
            <div
              onClick={handlePowerUpAudio}
              className="w-28 h-28 pixel-box-gold flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Click for Power-Up Fanfare!"
            >
              <span className="text-5xl select-none">🍄</span>
              <span className="font-pixel text-[8px] text-red-700 mt-1 font-bold">HERO</span>
            </div>
            <div className="mt-2 font-pixel text-[10px] bg-red-600 text-white px-2 py-1 border-2 border-black inline-block shadow-md">
              LVL {character.level}
            </div>
          </div>

          {/* Hero Identity & Titles */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-pixel text-[9px] bg-yellow-400 text-slate-950 px-2 py-1 border-2 border-black">
                {character.equippedTitleId || "SUPER ADVENTURER"}
              </span>
              <span className="font-pixel text-[9px] bg-sky-500 text-white px-2 py-1 border-2 border-black">
                PLAYER 1
              </span>
            </div>

            <h2 className="font-pixel text-xl sm:text-2xl text-yellow-400 tracking-wider">
              {character.name}
            </h2>

            <p className="text-xs text-slate-300 max-w-xl font-mono leading-relaxed">
              Discipline Warrior of the Mushroom Realm. Fulfilling daily quests, dodging procrastination
              goombas, and gathering gold coins to conquer life goals!
            </p>

            {/* Quick Metrics Bar (Chunky Arcade Badges) */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="pixel-box px-3 py-1.5 bg-slate-900 border-2 border-sky-400 text-sky-400 font-pixel text-[10px] flex items-center gap-1.5">
                <span>⭐</span>
                <span>{formatNumber(character.totalXp)} LIFETIME XP</span>
              </div>
              <div className="pixel-box px-3 py-1.5 bg-slate-900 border-2 border-yellow-400 text-yellow-400 font-pixel text-[10px] flex items-center gap-1.5">
                <span className="pixel-coin-spin inline-block">🪙</span>
                <span>{formatNumber(character.gold)} COINS</span>
              </div>
              <div className="pixel-box px-3 py-1.5 bg-slate-900 border-2 border-orange-500 text-orange-400 font-pixel text-[10px] flex items-center gap-1.5">
                <span>🔥</span>
                <span>{streak?.currentStreak || 0}D STREAK (BEST: {streak?.longestStreak || 0}D)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Level Progression Bar */}
        <div className="p-4 bg-slate-900 border-2 border-slate-700 space-y-2">
          <div className="flex justify-between items-center font-pixel text-[10px]">
            <span className="text-yellow-400">HERO LEVEL {character.level} PROGRESS</span>
            <span className="text-emerald-400">
              {xpProgress?.currentProgressXP || 0} / {xpProgress?.xpNeededForNextLevel || 100} XP ({xpProgress?.percentage || 0}%)
            </span>
          </div>
          <div className="w-full h-4 bg-slate-950 border-2 border-black overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 transition-all duration-500"
              style={{ width: `${xpProgress?.percentage || 0}%` }}
            />
          </div>
          <p className="font-retro text-[11px] text-slate-400 text-right">
            +{ (xpProgress?.xpNeededForNextLevel || 100) - (xpProgress?.currentProgressXP || 0) } XP until Level {character.level + 1} 1-UP!
          </p>
        </div>
      </div>

      {/* Attributes RPG Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-pixel text-sm text-yellow-400 flex items-center gap-2">
            <span>⚡</span>
            <span>CORE ATTRIBUTE MATRIX</span>
          </h3>
          <span className="font-retro text-xs text-slate-400">
            Powered by trial category completions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributes.map((attr) => {
            const meta = ATTR_METADATA[attr.type] || ATTR_METADATA.DISCIPLINE;
            const calc = getAttributeLevelFromXP(attr.currentXp);

            return (
              <div
                key={attr.id}
                className="pixel-box p-5 bg-[#181824] border-2 border-slate-700 space-y-3 hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 pixel-box bg-slate-900 border-2 border-slate-600 flex items-center justify-center text-xl shrink-0">
                      {meta.icon}
                    </div>
                    <div>
                      <div className="font-pixel text-[11px] text-yellow-300 tracking-wider">
                        {meta.marioName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-retro">
                        {meta.label} • {formatNumber(attr.currentXp)} Total XP
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-pixel text-[8px] text-slate-400 uppercase">POWER RANK</div>
                    <div className="font-pixel text-sm text-yellow-400">LV {calc.level}</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-mono">{meta.desc}</p>

                {/* Stepped Pixel Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between font-pixel text-[8px] text-slate-400">
                    <span>PROGRESS TO RANK {calc.level + 1}</span>
                    <span className="text-yellow-300">{calc.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 border-2 border-black overflow-hidden p-0.5">
                    <div
                      className={`h-full ${meta.barColor} transition-all duration-500`}
                      style={{ width: `${calc.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mario Star Medals Section */}
      <section className="pixel-box-gold p-6 text-slate-950 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <h3 className="font-pixel text-xs font-bold text-yellow-900 uppercase">
            SUPER STAR STAT BONUS ACTIVE
          </h3>
        </div>
        <p className="font-retro text-xs text-yellow-950 leading-relaxed">
          Maintain your streak above 3 days to keep the Super Star invincibility boost flowing! All trial
          completions yield bonus coins and accelerate your hero level ascension.
        </p>
      </section>
    </div>
  );
}
