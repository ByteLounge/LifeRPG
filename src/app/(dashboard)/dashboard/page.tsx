"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGame } from "@/components/providers/GameProvider";
import { DomainQuest } from "@/server/repositories/types";
import { CreateQuestModal } from "@/components/quests/CreateQuestModal";
import { formatNumber } from "@/lib/utils";
import { getAttributeLevelFromXP } from "@/lib/game-engine/progression";
import { soundEngine } from "@/lib/sound";

const ATTR_ICONS: Record<string, string> = {
  INTELLECT: "📜",
  STRENGTH: "💪",
  DISCIPLINE: "🔥",
  CREATIVITY: "🎨",
  VITALITY: "🍄",
  SOCIAL: "🤝",
};

export default function DashboardPage() {
  const {
    character,
    profile,
    attributes,
    streak,
    xpProgress,
    completeQuestOptimistic,
    refreshGameData,
  } = useGame();

  const [quests, setQuests] = useState<DomainQuest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch("/api/quests?status=ACTIVE");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setQuests(json.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingQuests(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleComplete = async (questId: string) => {
    if (completingId) return;
    setCompletingId(questId);
    soundEngine.playCoin();

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completedToday: true } : q))
    );

    const result = await completeQuestOptimistic(questId);
    if (!result.success) {
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, completedToday: false } : q))
      );
    } else {
      await fetchQuests();
    }
    setCompletingId(null);
  };

  const completedTodayCount = quests.filter((q) => q.completedToday).length;
  const totalQuestsToday = quests.length;
  const dailyGoalTarget = 3;

  return (
    <div className="space-y-6 select-none font-pixel">
      {/* 2D Mario Stage Header Card */}
      <section className="p-6 md:p-8 pixel-box bg-[#101018] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#E52521] border-2 border-black text-white text-[9px] px-2 py-0.5 font-bold">
                STAGE 1-{character?.level || 1}
              </span>
              {character?.equippedTitleId && (
                <span className="text-[9px] text-[#FBD000]">
                  ★ {character.equippedTitleId.toUpperCase()} ★
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-black text-[#FBD000] drop-shadow-[2px_2px_0_#000]">
              {character?.name.toUpperCase() || "PLAYER 1"}
            </h1>

            <p className="font-retro text-xs md:text-sm text-slate-300 max-w-xl">
              Fulfill your daily trials to power up stats and collect shiny gold coins!
            </p>
          </div>

          {/* Retro Stat Blocks */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-[#202030] border-2 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
              <span className="text-xl">🍄</span>
              <div>
                <div className="text-[8px] text-[#A0A0B0]">HERO LEVEL</div>
                <div className="text-sm font-bold text-[#FBD000]">LVL {character?.level || 1}</div>
              </div>
            </div>

            <div className="p-3 bg-[#202030] border-2 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-[8px] text-[#A0A0B0]">FIRE STREAK</div>
                <div className="text-sm font-bold text-[#E52521]">{streak?.currentStreak || 0} DAYS</div>
              </div>
            </div>

            <div className="p-3 bg-[#202030] border-2 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
              <span className="text-xl pixel-coin-spin">🪙</span>
              <div>
                <div className="text-[8px] text-[#A0A0B0]">COIN TREASURY</div>
                <div className="text-sm font-bold text-[#FBD000]">{formatNumber(character?.gold || 0)} G</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stepped Pixel XP Progress Bar */}
        {xpProgress && (
          <div className="mt-6 pt-6 border-t-2 border-[#303048]">
            <div className="flex justify-between text-[10px] text-[#A0A0B0] mb-1.5">
              <span>EXP TO NEXT LEVEL</span>
              <span className="text-[#5C94FC] font-bold">
                {xpProgress.currentProgressXP} / {xpProgress.xpNeededForNextLevel} XP ({xpProgress.percentage}%)
              </span>
            </div>
            <div className="pixel-bar-container">
              <div className="pixel-bar-fill-gold" style={{ width: `${xpProgress.percentage}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* Main Grid: Active Quests + Bonus Stage / Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Quests */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-white">TODAY&apos;S QUESTS</h2>
              <span className="bg-[#E52521] text-white text-[9px] px-2 py-0.5 border border-black">
                {completedTodayCount}/{totalQuestsToday}
              </span>
            </div>

            <button
              onClick={() => {
                soundEngine.playJump();
                setIsCreateModalOpen(true);
              }}
              className="pixel-btn pixel-btn-green text-[9px] py-2 px-3"
            >
              + NEW QUEST
            </button>
          </div>

          {loadingQuests ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#202030] border-2 border-black animate-pulse" />
              ))}
            </div>
          ) : quests.length === 0 ? (
            <div className="p-8 pixel-box text-center space-y-3">
              <span className="text-3xl">🍄</span>
              <h3 className="text-xs font-bold text-white">NO QUESTS IN JOURNAL</h3>
              <p className="font-retro text-xs text-slate-400 max-w-sm mx-auto">
                Hit the &apos;+ NEW QUEST&apos; button to scribe your first real-world trial!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quests.map((q) => {
                const isCompleted = q.completedToday;
                const icon = ATTR_ICONS[q.attributeType] || "⚔️";

                return (
                  <div
                    key={q.id}
                    className={`p-4 border-4 border-black transition-all flex items-center justify-between gap-4 ${
                      isCompleted
                        ? "bg-[#102014] shadow-[0_3px_0_#000] opacity-80"
                        : "bg-[#202030] hover:bg-[#282838] shadow-[0_4px_0_#000]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Clickable Question Block Action */}
                      <button
                        onClick={() => handleComplete(q.id)}
                        disabled={isCompleted || completingId === q.id}
                        className={`w-9 h-9 shrink-0 flex items-center justify-center font-pixel text-sm border-2 border-black transition-transform ${
                          isCompleted
                            ? "bg-[#00A800] text-white cursor-default"
                            : "bg-[#FBD000] text-black hover:scale-105 active:scale-95 shadow-[2px_2px_0_#000]"
                        }`}
                        title={isCompleted ? "Course Cleared!" : "Hit to Complete!"}
                      >
                        {isCompleted ? "✓" : "?"}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.5 border border-black ${
                              q.difficulty === "EASY"
                                ? "bg-[#00A800] text-white"
                                : q.difficulty === "MEDIUM"
                                ? "bg-[#5C94FC] text-black"
                                : q.difficulty === "HARD"
                                ? "bg-[#FBD000] text-black"
                                : "bg-[#E52521] text-white"
                            }`}
                          >
                            {q.difficulty}
                          </span>

                          <span className="text-[9px] text-[#FBD000]">
                            {icon} {q.attributeType}
                          </span>

                          <span className="text-[8px] text-[#A0A0B0]">
                            ⏱ {q.estimatedMinutes}M
                          </span>
                        </div>

                        <h3
                          className={`text-xs font-bold truncate ${
                            isCompleted ? "line-through text-[#608060]" : "text-white"
                          }`}
                        >
                          {q.title.toUpperCase()}
                        </h3>

                        {q.description && (
                          <p className="font-retro text-xs text-slate-400 mt-1 line-clamp-1">
                            {q.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rewards Tag */}
                    <div className="shrink-0 text-right text-[9px] font-bold">
                      <div className="text-[#5C94FC]">
                        +{q.difficulty === "EASY" ? 25 : q.difficulty === "MEDIUM" ? 50 : q.difficulty === "HARD" ? 100 : 250} XP
                      </div>
                      <div className="text-[#FBD000] flex items-center justify-end gap-1">
                        <span className="pixel-coin-spin">🪙</span>
                        <span>+{q.difficulty === "EASY" ? 15 : q.difficulty === "MEDIUM" ? 35 : q.difficulty === "HARD" ? 80 : 200}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: 2D Mario Bonus Stage & Attribute Power-ups */}
        <div className="space-y-6">
          {/* Bonus Stage Card */}
          <div className="p-5 question-block text-black shadow-[4px_4px_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-wider">
                ★ BONUS STAGE ★
              </span>
              <span className="text-[9px] font-black">
                {Math.min(dailyGoalTarget, completedTodayCount)} / {dailyGoalTarget}
              </span>
            </div>

            <h3 className="text-xs font-black mb-1">TRIO CLEARED CHALLENGE</h3>
            <p className="font-retro text-xs text-[#502000] mb-3 leading-tight font-bold">
              Hit 3 Quest Blocks today to unlock the secret star bonus!
            </p>

            <div className="pixel-bar-container bg-black mb-3">
              <div
                className="pixel-bar-fill-green"
                style={{ width: `${Math.min(100, (completedTodayCount / dailyGoalTarget) * 100)}%` }}
              />
            </div>

            <div className="text-[8px] font-black pt-2 border-t-2 border-black flex justify-between">
              <span>PRIZE:</span>
              <span className="text-[#E52521]">+100 EXP • +50 COINS</span>
            </div>
          </div>

          {/* Attributes Power-up Card */}
          <div className="p-5 pixel-box space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="text-xs font-black text-white">HERO POWER-UPS</h3>
              <Link
                href="/character"
                onClick={() => soundEngine.playJump()}
                className="text-[8px] text-[#FBD000] hover:underline"
              >
                SHEET ▶
              </Link>
            </div>

            <div className="space-y-3">
              {attributes.map((attr) => {
                const icon = ATTR_ICONS[attr.type] || "🍄";
                const calc = getAttributeLevelFromXP(attr.currentXp);

                return (
                  <div key={attr.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-white flex items-center gap-1.5">
                        <span>{icon}</span>
                        <span>{attr.type}</span>
                      </span>
                      <span className="text-[#FBD000]">LVL {calc.level}</span>
                    </div>

                    <div className="pixel-bar-container h-3.5">
                      <div className="pixel-bar-fill" style={{ width: `${calc.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CreateQuestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuestCreated={() => {
          fetchQuests();
          refreshGameData();
        }}
      />
    </div>
  );
}
