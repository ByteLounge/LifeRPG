"use client";

import React, { useState } from "react";
import {
  User,
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
} from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { getAttributeLevelFromXP } from "@/lib/game-engine/progression";
import { formatNumber } from "@/lib/utils";

const ATTR_METADATA: Record<
  string,
  { label: string; icon: typeof BookOpen; color: string; barColor: string }
> = {
  INTELLECT: { label: "Intellect", icon: BookOpen, color: "text-blue-400", barColor: "bg-blue-500" },
  STRENGTH: { label: "Strength", icon: Dumbbell, color: "text-red-400", barColor: "bg-red-500" },
  DISCIPLINE: { label: "Discipline", icon: Flame, color: "text-purple-400", barColor: "bg-purple-500" },
  CREATIVITY: { label: "Creativity", icon: Palette, color: "text-pink-400", barColor: "bg-pink-500" },
  VITALITY: { label: "Vitality", icon: Heart, color: "text-emerald-400", barColor: "bg-emerald-500" },
  SOCIAL: { label: "Social", icon: Users, color: "text-orange-400", barColor: "bg-orange-500" },
};

export default function CharacterPage() {
  const { character, profile, attributes, streak, xpProgress } = useGame();

  if (!character) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
          <Crown className="w-6 h-6 text-amber-400" />
          <span>Character Sheet & Statistics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed breakdown of your physical, mental, and disciplined progression.
        </p>
      </div>

      {/* Hero Avatar & Identity Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-8">
        {/* Avatar with Equipped Frame */}
        <div className="relative shrink-0">
          <div
            className={`w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-4xl shadow-2xl border-4 ${
              character.equippedFrameId || "border-amber-500/50 shadow-rpg-gold"
            }`}
          >
            ⚔️
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-md">
            Lvl {character.level}
          </div>
        </div>

        {/* Hero Identity & Prestiged Titles */}
        <div className="flex-1 text-center md:text-left space-y-2">
          {character.equippedTitleId && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{character.equippedTitleId}</span>
            </div>
          )}

          <h2 className="text-3xl font-black font-serif text-white tracking-wide">
            {character.name}
          </h2>

          <p className="text-xs text-slate-400 max-w-md">
            Dedicated hero striving for continuous self-evolution across mental clarity, physical
            fortitude, and relentless habits.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>{formatNumber(character.totalXp)} Lifetime XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{formatNumber(character.gold)} Gold Treasury</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>{streak?.currentStreak || 0} Day Streak (Best: {streak?.longestStreak || 0}d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes RPG Grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
          <span>Core Attributes</span>
          <span className="text-xs text-slate-400 font-sans font-normal">
            (Influenced by specific quest categories)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributes.map((attr) => {
            const meta = ATTR_METADATA[attr.type] || ATTR_METADATA.DISCIPLINE;
            const Icon = meta.icon;
            const calc = getAttributeLevelFromXP(attr.currentXp);

            return (
              <div
                key={attr.id}
                className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">{meta.label}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatNumber(attr.currentXp)} Total XP
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs uppercase text-slate-400 font-semibold">Tier Level</div>
                    <div className="text-base font-black text-amber-400 font-serif">Lvl {calc.level}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Progress to Lvl {calc.level + 1}</span>
                    <span>{calc.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${meta.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${calc.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
