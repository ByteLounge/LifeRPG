"use client";

import React from "react";
import { useGame, AttributeState } from "@/components/providers/GameProvider";
import { getAttributeLevelFromXP } from "@/lib/game-engine/progression";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

const DEFAULT_ATTRIBUTES: AttributeState[] = [
  { id: "attr_intellect", type: "INTELLECT", currentXp: 0, level: 1 },
  { id: "attr_strength", type: "STRENGTH", currentXp: 0, level: 1 },
  { id: "attr_discipline", type: "DISCIPLINE", currentXp: 0, level: 1 },
  { id: "attr_creativity", type: "CREATIVITY", currentXp: 0, level: 1 },
  { id: "attr_vitality", type: "VITALITY", currentXp: 0, level: 1 },
  { id: "attr_social", type: "SOCIAL", currentXp: 0, level: 1 },
];

const ATTR_METADATA: Record<
  string,
  { label: string; icon: string; color: string; barColor: string; desc: string }
> = {
  INTELLECT: {
    label: "Intellect",
    icon: "🧠",
    color: "text-blue-400",
    barColor: "bg-blue-500",
    desc: "Level up through study sessions, reading books, and coding practice.",
  },
  STRENGTH: {
    label: "Strength",
    icon: "💥",
    color: "text-red-400",
    barColor: "bg-red-500",
    desc: "Level up through gym workouts, sports, running, and physical fitness.",
  },
  DISCIPLINE: {
    label: "Discipline",
    icon: "🔥",
    color: "text-amber-400",
    barColor: "bg-amber-500",
    desc: "Level up through daily habits, waking up early, and keeping streaks.",
  },
  CREATIVITY: {
    label: "Creativity",
    icon: "🎨",
    color: "text-pink-400",
    barColor: "bg-pink-500",
    desc: "Level up through writing, designing, making music, and side projects.",
  },
  VITALITY: {
    label: "Vitality",
    icon: "❤️",
    color: "text-emerald-400",
    barColor: "bg-emerald-500",
    desc: "Level up through drinking water, eating healthy, and getting good sleep.",
  },
  SOCIAL: {
    label: "Social",
    icon: "🤝",
    color: "text-orange-400",
    barColor: "bg-orange-500",
    desc: "Level up through spending time with friends, family, and teamwork.",
  },
};

export default function CharacterPage() {
  const { character, profile, attributes, streak, xpProgress } = useGame();

  const handleHeroJump = () => {
    soundEngine.playJump();
  };

  const handlePowerUpAudio = () => {
    soundEngine.playPowerUp();
  };

  if (!character) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto question-block flex items-center justify-center font-pixel text-2xl text-yellow-950 animate-bounce">
          ?
        </div>
        <p className="font-pixel text-xs text-yellow-400">LOADING PROFILE & SKILLS...</p>
      </div>
    );
  }

  const displayAttributes = attributes && attributes.length > 0 ? attributes : DEFAULT_ATTRIBUTES;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="pixel-box-mario p-4 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-yellow-300 bg-red-950/60 px-2 py-0.5 border border-yellow-400">
              PROFILE & SKILLS
            </span>
          </div>
          <h1 className="font-pixel text-base sm:text-xl text-yellow-300 tracking-wider">
            YOUR PROFILE & LIFE SKILLS
          </h1>
          <p className="font-retro text-xs text-red-100 mt-1">
            See how your real-world activities increase your 6 core life skills.
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

      {/* Avatar & Identity Card */}
      <div className="pixel-box p-6 md:p-8 bg-[#181824] space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Chunky Pixel Frame */}
          <div className="relative shrink-0 text-center">
            <div
              onClick={handlePowerUpAudio}
              className="w-28 h-28 pixel-box-gold flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Click to play power-up sound!"
            >
              <span className="text-5xl select-none">🍄</span>
              <span className="font-pixel text-[8px] text-red-700 mt-1 font-bold">PLAYER</span>
            </div>
            <div className="mt-2 font-pixel text-[10px] bg-red-600 text-white px-2 py-1 border-2 border-black inline-block shadow-md">
              LVL {character.level}
            </div>
          </div>

          {/* Hero Identity */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-pixel text-[9px] bg-yellow-400 text-slate-950 px-2 py-1 border-2 border-black">
                {character.equippedTitleId || "ADVENTURER"}
              </span>
              <span className="font-pixel text-[9px] bg-sky-500 text-white px-2 py-1 border-2 border-black">
                PLAYER 1
              </span>
            </div>

            <h2 className="font-pixel text-xl sm:text-2xl text-yellow-400 tracking-wider">
              {character.name}
            </h2>

            <p className="text-xs text-slate-300 max-w-xl font-retro leading-relaxed">
              Leveling up daily habits, study goals, and health routines one task at a time.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="pixel-box px-3 py-1.5 bg-slate-900 border-2 border-sky-400 text-sky-400 font-pixel text-[10px] flex items-center gap-1.5">
                <span>⭐</span>
                <span>{formatNumber(character.totalXp)} TOTAL XP</span>
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

        {/* Level Progression Bar */}
        <div className="p-4 bg-slate-900 border-2 border-slate-700 space-y-2">
          <div className="flex justify-between items-center font-pixel text-[10px]">
            <span className="text-yellow-400">LEVEL {character.level} PROGRESS</span>
            <span className="text-emerald-400 font-retro">
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
            +{ (xpProgress?.xpNeededForNextLevel || 100) - (xpProgress?.currentProgressXP || 0) } XP until Level {character.level + 1}
          </p>
        </div>
      </div>

      {/* Attributes Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-pixel text-sm text-yellow-400 flex items-center gap-2">
            <span>⚡</span>
            <span>THE 6 CORE LIFE SKILLS</span>
          </h3>
          <span className="font-retro text-xs text-slate-400">
            Earn XP in each skill by completing related tasks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayAttributes.map((attr) => {
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
                      <div className="font-pixel text-xs text-yellow-300 tracking-wider">
                        {meta.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-retro">
                        {formatNumber(attr.currentXp)} Total XP
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-pixel text-[8px] text-slate-400 uppercase">RANK</div>
                    <div className="font-pixel text-sm text-yellow-400">Level {calc.level}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-retro leading-relaxed">{meta.desc}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between font-pixel text-[8px] text-slate-400">
                    <span>PROGRESS TO LEVEL {calc.level + 1}</span>
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

      {/* Streak Bonus Info */}
      <section className="pixel-box-gold p-6 text-slate-950 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <h3 className="font-pixel text-xs font-bold text-yellow-900 uppercase">
            DAILY STREAK BONUS ACTIVE
          </h3>
        </div>
        <p className="font-retro text-xs text-yellow-950 leading-relaxed">
          Keep your daily streak going above 3 days to earn bonus coins on every completed task!
        </p>
      </section>
    </div>
  );
}
