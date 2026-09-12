"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Award, Lock, CheckCircle2, Sparkles, Coins, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

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

  const handleAchievementClick = (ach: AchievementItem) => {
    if (ach.isUnlocked) {
      soundEngine.playLevelUp();
    } else {
      soundEngine.playPowerDown();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Progress Banner */}
      <div className="pixel-box-gold p-6 md:p-8 text-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[9px] bg-red-600 text-white px-2 py-0.5 border border-black">
                WORLD CLEAR
              </span>
              <span className="font-pixel text-[9px] text-yellow-900">STAR MEDAL COLLECTION</span>
            </div>
            <h1 className="font-pixel text-base sm:text-xl text-yellow-950 tracking-wider">
              ★ HALL OF POWER STARS & TROPHIES ★
            </h1>
            <p className="font-retro text-xs text-yellow-900 mt-1">
              Permanent 8-bit accolades celebrating your relentless habits and breakthrough trials!
            </p>
          </div>

          <div className="px-3.5 py-2 pixel-box bg-slate-950 text-yellow-400 font-pixel text-xs border-2 border-black w-fit">
            ⭐ {totalUnlocked} / {totalAvailable} STARS ({percentage}%)
          </div>
        </div>

        {/* Stepped Pixel Progress Bar */}
        <div className="w-full h-4 bg-slate-950 border-2 border-black p-0.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 pixel-box bg-slate-900 animate-pulse border-2 border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              onClick={() => handleAchievementClick(ach)}
              className={`pixel-box p-5 border-2 cursor-pointer transition-all flex items-start gap-4 select-none ${
                ach.isUnlocked
                  ? "bg-[#1f2937] border-yellow-400 shadow-[4px_4px_0px_#eab308] hover:translate-y-[-2px]"
                  : "bg-[#14141e] border-slate-800 opacity-75 hover:opacity-90"
              }`}
            >
              {/* Icon / Question Block */}
              <div
                className={`w-14 h-14 shrink-0 flex items-center justify-center text-3xl border-2 ${
                  ach.isUnlocked
                    ? "bg-yellow-400 border-black shadow-inner"
                    : "question-block text-xl text-yellow-950 font-pixel"
                }`}
              >
                {ach.isUnlocked ? ach.icon : "?"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-pixel text-xs text-white truncate tracking-wide">{ach.name}</h3>
                  {ach.isUnlocked ? (
                    <span className="font-pixel text-[8px] bg-emerald-600 text-white px-2 py-0.5 border border-black shrink-0">
                      ★ CLEARED!
                    </span>
                  ) : (
                    <span className="font-pixel text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 border border-slate-700 shrink-0">
                      LOCKED
                    </span>
                  )}
                </div>

                <p className="font-retro text-xs text-slate-300 leading-relaxed mb-3">
                  {ach.description}
                </p>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t-2 border-slate-700">
                  <div className="flex items-center gap-3 font-pixel">
                    <span className="text-sky-400">+{ach.rewardXp} XP</span>
                    <span className="text-yellow-400">+{ach.rewardGold} COINS</span>
                  </div>

                  {ach.isUnlocked && ach.unlockedAt && (
                    <span className="font-retro text-slate-400">
                      Cleared {formatDate(ach.unlockedAt)}
                    </span>
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
