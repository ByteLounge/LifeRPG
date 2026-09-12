"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Award, Lock, CheckCircle2, Sparkles, Coins, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rewardXp: number;
  rewardGold: number;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAchievements(json.data.achievements);
          setTotalUnlocked(json.data.totalUnlocked);
          setTotalAvailable(json.data.totalAvailable);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const percentage = totalAvailable > 0 ? Math.round((totalUnlocked / totalAvailable) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Progress */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#111827] via-[#131d2e] to-[#0c121e] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Hall of Triumphs & Milestones</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Permanent accolades celebrating your discipline and cumulative breakthroughs.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400 w-fit">
            {totalUnlocked} / {totalAvailable} Unlocked ({percentage}%)
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700 shadow-rpg-gold"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                ach.isUnlocked
                  ? "bg-slate-900/90 border-amber-500/50 shadow-rpg-gold"
                  : "bg-[#111827]/60 border-slate-800/80 opacity-70"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                  ach.isUnlocked
                    ? "bg-amber-500/15 border-amber-500/40 shadow-sm"
                    : "bg-slate-800/50 border-slate-700/50 grayscale"
                }`}
              >
                {ach.isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-white truncate">{ach.name}</h3>
                  {ach.isUnlocked && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">{ach.description}</p>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-3 font-mono font-semibold">
                    <span className="text-sky-400">+{ach.rewardXp} XP</span>
                    <span className="text-amber-400">+{ach.rewardGold} Gold</span>
                  </div>

                  {ach.isUnlocked && ach.unlockedAt && (
                    <span className="text-slate-500">Achieved {formatDate(ach.unlockedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
