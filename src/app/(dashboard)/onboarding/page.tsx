"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/providers/GameProvider";
import { Sparkles, Shield, ArrowRight, Loader2, Dumbbell, BookOpen, Flame, Palette, Heart, Users } from "lucide-react";

const ATTRIBUTES = [
  { id: "INTELLECT", label: "Intellect", desc: "Study, coding, deep reading & problem solving", icon: BookOpen, color: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  { id: "STRENGTH", label: "Strength", desc: "Fitness, weightlifting, athletic conditioning", icon: Dumbbell, color: "text-red-400 border-red-500/40 bg-red-500/10" },
  { id: "DISCIPLINE", label: "Discipline", desc: "Focus, waking early, habits & unbroken consistency", icon: Flame, color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  { id: "CREATIVITY", label: "Creativity", desc: "Design, writing, art, innovative engineering", icon: Palette, color: "text-pink-400 border-pink-500/40 bg-pink-500/10" },
  { id: "VITALITY", label: "Vitality", desc: "Hydration, sleep, nutrition & recovery", icon: Heart, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  { id: "SOCIAL", label: "Social", desc: "Networking, leadership, mentoring & connection", icon: Users, color: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
];

const THEMES = [
  { id: "dark", label: "Arcane Obsidian", desc: "Deep dark fantasy with glowing cyan & gold" },
  { id: "light", label: "Solar Parchment", desc: "Crisp bright parchment with amber accents" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { character, refreshGameData, setTheme } = useGame();

  const [charName, setCharName] = useState(character?.name || "Brave Adventurer");
  const [selectedAttr, setSelectedAttr] = useState("DISCIPLINE");
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
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
        setTheme(selectedTheme);
        await refreshGameData();
        router.push("/dashboard");
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center text-slate-950 font-black shadow-rpg-gold">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-serif text-white tracking-wide">
            Initiate Character Chronicle
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Choose your core developmental focus to calibrate your introductory quest rewards.
          </p>
        </div>

        {/* Character Title */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Character Title / Hero Handle
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="e.g. Roland the Unyielding"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Core Focus Attribute */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Primary Focus Attribute (+25 Starter XP Bonus)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ATTRIBUTES.map((attr) => {
              const Icon = attr.icon;
              const isSelected = selectedAttr === attr.id;
              return (
                <div
                  key={attr.id}
                  onClick={() => setSelectedAttr(attr.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-rpg-gold"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`p-1.5 rounded-lg border ${attr.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? "text-amber-400" : "text-slate-200"}`}>
                      {attr.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{attr.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Preference */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Preferred Realm Environment
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className={`text-sm font-bold ${isSelected ? "text-amber-400" : "text-slate-200"}`}>
                    {theme.label}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{theme.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleComplete}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Begin Heroic Journey</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
