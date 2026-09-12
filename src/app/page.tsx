"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Flame,
  Award,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sword,
  Scroll,
} from "lucide-react";
import { soundEngine } from "@/lib/sound";

export default function LandingPage() {
  const [demoCompleted, setDemoCompleted] = useState(false);
  const [demoXp, setDemoXp] = useState(50);
  const [demoGold, setDemoGold] = useState(35);

  const handleDemoComplete = () => {
    if (demoCompleted) return;
    setDemoCompleted(true);
    setDemoXp((prev) => prev + 50);
    setDemoGold((prev) => prev + 35);
    soundEngine.playQuestComplete();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-rpg-gold">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-serif font-black tracking-wider text-lg text-white">LIFE RPG</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            Begin Journey
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-4 h-4 text-amber-400" />
          Server-Authoritative Real Life RPG
        </div>

        <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-white mb-6 leading-tight">
          Turn Everyday Tasks Into An <br />
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Epic RPG Adventure
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Stop struggling with generic to-do lists. Complete real-world study, workouts, and work
          goals to gain XP, unlock heroic gear, level up your stats, and build unbroken streaks.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Create Your Character</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-colors"
          >
            Enter Realm Demo
          </Link>
        </div>

        {/* Live Interactive Quest Preview Card */}
        <div className="w-full max-w-lg p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sword className="w-4 h-4" />
              Interactive Quest Preview
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-sky-400 font-bold">{demoXp} XP</span>
              <span className="text-amber-400 font-bold">🪙 {demoGold} Gold</span>
            </div>
          </div>

          <div
            onClick={handleDemoComplete}
            className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
              demoCompleted
                ? "bg-emerald-950/20 border-emerald-500/50"
                : "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-amber-500/50 shadow-md"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                  demoCompleted
                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                    : "border-slate-600 bg-slate-800 text-transparent"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4
                  className={`text-sm font-bold ${
                    demoCompleted ? "line-through text-slate-500" : "text-slate-100"
                  }`}
                >
                  Deep Focus: Complete 45 Minutes of Study / Coding
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Rewards: +50 XP • +35 Gold • +30 Intellect XP
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                demoCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {demoCompleted ? "COMPLETED" : "CLICK TO COMPLETE"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-3">
            Try clicking the quest card above to test the tactile feedback!
          </p>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="border-t border-slate-800/80 py-16 px-4 bg-[#090D15]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif mb-2">Server-Authoritative Progression</h3>
            <p className="text-sm text-slate-400">
              No fake client stats or easily tampered localStorage. All XP gains, non-linear level curves, and reward calculations are locked down server-side.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif mb-2">Timezone-Aware Streaks</h3>
            <p className="text-sm text-slate-400">
              Never lose your streak unfairly across timezones. The streak engine accurately calculates calendar boundaries to fuel continuous momentum.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif mb-2">Bazaar, Cosmetics & Titles</h3>
            <p className="text-sm text-slate-400">
              Spend earned gold in the virtual shop to customize your hero with rare avatar frames, prestiged titles, and unlockable themes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        © 2026 Life RPG. Built for high-performance productivity and heroic discipline.
      </footer>
    </div>
  );
}
