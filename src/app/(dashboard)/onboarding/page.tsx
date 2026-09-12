"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/providers/GameProvider";
import { Sparkles, Shield, ArrowRight, Loader2, Dumbbell, BookOpen, Flame, Palette, Heart, Users } from "lucide-react";
import { soundEngine } from "@/lib/sound";

const ATTRIBUTES = [
  {
    id: "INTELLECT",
    label: "Brain Power (Intellect)",
    desc: "Study, coding logic, deep reading & problem solving",
    icon: "🧠",
    color: "border-blue-500 bg-blue-950/40 text-blue-300",
  },
  {
    id: "STRENGTH",
    label: "Jump Attack (Strength)",
    desc: "Fitness conditioning, workouts & physical fortitude",
    icon: "💥",
    color: "border-red-500 bg-red-950/40 text-red-300",
  },
  {
    id: "DISCIPLINE",
    label: "Fire Flow (Discipline)",
    desc: "Habit fire, unbroken daily streaks & waking early",
    icon: "🔥",
    color: "border-yellow-500 bg-yellow-950/40 text-yellow-300",
  },
  {
    id: "CREATIVITY",
    label: "Star Spark (Creativity)",
    desc: "Design, writing, art, engineering inventions",
    icon: "🎨",
    color: "border-pink-500 bg-pink-950/40 text-pink-300",
  },
  {
    id: "VITALITY",
    label: "Max HP (Vitality)",
    desc: "Hydration, sleep discipline, nutrition & recovery",
    icon: "❤️",
    color: "border-emerald-500 bg-emerald-950/40 text-emerald-300",
  },
  {
    id: "SOCIAL",
    label: "Bros Bond (Social)",
    desc: "Networking, leadership, mentoring & multiplayer teamwork",
    icon: "🤝",
    color: "border-orange-500 bg-orange-950/40 text-orange-300",
  },
];

const THEMES = [
  { id: "dark", label: "ARCANE OBSIDIAN", desc: "Dark realm with glowing 8-bit neon pixel accents" },
  { id: "light", label: "SOLAR PARCHMENT", desc: "Crisp bright overworld parchment with amber accents" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { character, refreshGameData, setTheme } = useGame();

  const [charName, setCharName] = useState(character?.name || "Jumpman the Brave");
  const [selectedAttr, setSelectedAttr] = useState("DISCIPLINE");
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    soundEngine.playCoin();
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: charName,
          preferredTheme: selectedTheme,
          focusAttribute: selectedAttr,
        }),
      });

      if (res.ok) {
        soundEngine.playLevelUp();
        setTheme(selectedTheme);
        await refreshGameData();
        router.push("/dashboard");
      } else {
        soundEngine.playPowerDown();
      }
    } catch {
      soundEngine.playPowerDown();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="pixel-box p-8 bg-[#181824] border-2 border-yellow-400 shadow-[6px_6px_0px_#eab308] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 question-block items-center justify-center font-pixel text-2xl text-yellow-950 mb-1">
            ?
          </div>
          <div className="font-pixel text-[10px] text-yellow-400 tracking-wider">
            ★ WORLD 1-1 CHARACTER PROLOGUE ★
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-white tracking-wide">
            CALIBRATE YOUR HERO
          </h2>
          <p className="font-retro text-xs text-slate-400 max-w-md mx-auto">
            Choose your primary attribute focus to unlock a starter XP bonus and calibrate trial rewards!
          </p>
        </div>

        {/* Character Title */}
        <div className="space-y-2">
          <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
            HERO TITLE / RPG MONIKER
          </label>
          <div className="relative">
            <span className="text-sm absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">⭐</span>
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="e.g. Jumpman the Brave"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
            />
          </div>
        </div>

        {/* Core Focus Attribute */}
        <div className="space-y-3">
          <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
            PRIMARY POWER ATTRIBUTE (+25 STARTER XP BONUS)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ATTRIBUTES.map((attr) => {
              const isSelected = selectedAttr === attr.id;
              return (
                <div
                  key={attr.id}
                  onClick={() => {
                    soundEngine.playPause();
                    setSelectedAttr(attr.id);
                  }}
                  className={`p-3.5 border-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-slate-900 border-yellow-400 shadow-[3px_3px_0px_#eab308]"
                      : "bg-slate-950 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xl">{attr.icon}</span>
                    <span className={`font-pixel text-[10px] ${isSelected ? "text-yellow-400" : "text-white"}`}>
                      {attr.label}
                    </span>
                  </div>
                  <p className="font-retro text-xs text-slate-400 leading-relaxed">{attr.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Realm Theme */}
        <div className="space-y-3">
          <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
            PREFERRED REALM PALETTE
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    soundEngine.playPause();
                    setSelectedTheme(theme.id);
                  }}
                  className={`p-3.5 border-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-slate-900 border-yellow-400 shadow-[3px_3px_0px_#eab308]"
                      : "bg-slate-950 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className={`font-pixel text-[10px] ${isSelected ? "text-yellow-400" : "text-white"}`}>
                    {theme.label}
                  </div>
                  <p className="font-retro text-xs text-slate-400 mt-1">{theme.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleComplete}
          disabled={submitting}
          className="pixel-btn pixel-btn-yellow w-full py-3.5 text-slate-950 font-pixel text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>★ COMMENCE HEROIC QUEST (WORLD 1-1) ★</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
