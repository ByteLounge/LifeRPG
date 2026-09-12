"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/providers/GameProvider";
import { ArrowRight, Loader2 } from "lucide-react";
import { soundEngine } from "@/lib/sound";

const ATTRIBUTES = [
  {
    id: "INTELLECT",
    label: "Intellect",
    desc: "Study sessions, coding, deep reading & problem solving",
    icon: "🧠",
  },
  {
    id: "STRENGTH",
    label: "Strength",
    desc: "Fitness conditioning, gym workouts & athletic training",
    icon: "💥",
  },
  {
    id: "DISCIPLINE",
    label: "Discipline",
    desc: "Daily habits, unbroken streaks & waking up early",
    icon: "🔥",
  },
  {
    id: "CREATIVITY",
    label: "Creativity",
    desc: "Writing, design, art, music & side projects",
    icon: "🎨",
  },
  {
    id: "VITALITY",
    label: "Vitality",
    desc: "Hydration, sleep routines, nutrition & recovery",
    icon: "❤️",
  },
  {
    id: "SOCIAL",
    label: "Social",
    desc: "Friends, family, mentoring & teamwork",
    icon: "🤝",
  },
];

const THEMES = [
  { id: "dark", label: "DARK THEME", desc: "Classic dark arcade mode with neon colors" },
  { id: "light", label: "LIGHT THEME", desc: "Bright daytime overworld screen style" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { character, refreshGameData, setTheme } = useGame();

  const [charName, setCharName] = useState(character?.name || "Player 1");
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
            ★ WELCOME TO LIFE RPG ★
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-white tracking-wide">
            SET UP YOUR PROFILE
          </h2>
          <p className="font-retro text-xs text-slate-400 max-w-md mx-auto">
            Pick your primary focus skill to get +25 bonus starter XP and choose your preferred screen theme.
          </p>
        </div>

        {/* Character Title */}
        <div className="space-y-2">
          <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
            YOUR CHARACTER NICKNAME
          </label>
          <div className="relative">
            <span className="text-sm absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">⭐</span>
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="e.g. Alex the Brave"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
            />
          </div>
        </div>

        {/* Core Focus Attribute */}
        <div className="space-y-3">
          <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
            STARTING FOCUS SKILL (+25 BONUS STARTER XP)
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
            PREFERRED SCREEN THEME
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
              <span>★ GET STARTED (GO TO DASHBOARD) ★</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
