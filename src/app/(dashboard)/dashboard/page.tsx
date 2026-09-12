"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Shield,
  Coins,
  ArrowRight,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Dumbbell,
  Palette,
  Heart,
  Users,
} from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { DomainQuest } from "@/server/repositories/types";
import { CreateQuestModal } from "@/components/quests/CreateQuestModal";
import { formatNumber } from "@/lib/utils";
import { getAttributeLevelFromXP } from "@/lib/game-engine/progression";

const ATTR_ICONS: Record<string, typeof BookOpen> = {
  INTELLECT: BookOpen,
  STRENGTH: Dumbbell,
  DISCIPLINE: Flame,
  CREATIVITY: Palette,
  VITALITY: Heart,
  SOCIAL: Users,
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

    // Optimistically toggle completion on UI
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completedToday: true } : q))
    );

    const result = await completeQuestOptimistic(questId);
    if (!result.success) {
      // Rollback
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
  const dailyGoalCompleted = completedTodayCount >= dailyGoalTarget;

  return (
    <div className="space-y-8">
      {/* Hero Progression Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#131c2e] to-[#0c121e] border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Hero Status
              </span>
              {character?.equippedTitleId && (
                <span className="text-xs text-slate-400 italic">
                  &quot;{character.equippedTitleId}&quot;
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-serif text-white tracking-wide">
              {character?.name || profile?.displayName || "Hero of the Realm"}
            </h1>

            <p className="text-sm text-slate-400 max-w-xl">
              Welcome back to your command ledger. Today is a clean canvas to forge discipline and
              expand your heroic attributes.
            </p>
          </div>

          {/* Quick Stat Pill Trio */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Level</div>
                <div className="text-lg font-bold text-amber-400 font-serif">Lvl {character?.level || 1}</div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Streak</div>
                <div className="text-lg font-bold text-orange-400">{streak?.currentStreak || 0} Days</div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Treasury</div>
                <div className="text-lg font-bold text-amber-300">{formatNumber(character?.gold || 0)} G</div>
              </div>
            </div>
          </div>
        </div>

        {/* Big XP Progress Bar */}
        {xpProgress && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400 font-medium">
                Experience to Level <span className="text-white font-bold">{xpProgress.nextLevel}</span>
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {xpProgress.currentProgressXP} / {xpProgress.xpNeededForNextLevel} XP ({xpProgress.percentage}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-400 rounded-full transition-all duration-700 shadow-rpg-glow"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Main Grid: Today's Quests (Left) + Daily Challenge & Attributes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Today's Active Quests */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
                <span>Today&apos;s Active Quests</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {completedTodayCount}/{totalQuestsToday}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Complete tasks to earn XP and Gold instantly</p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Scribe Quest</span>
            </button>
          </div>

          {/* Quests List */}
          {loadingQuests ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : quests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <Shield className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Your quest log is empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active quests found. Create your first challenge to ignite your daily momentum.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-semibold text-xs transition-colors"
              >
                + Create First Quest
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {quests.map((q) => {
                const isCompleted = q.completedToday;
                const AttrIcon = ATTR_ICONS[q.attributeType] || Flame;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isCompleted
                        ? "bg-slate-900/40 border-emerald-500/30 opacity-75"
                        : "bg-[#111827] hover:bg-[#131d2e] border-slate-800 hover:border-slate-700 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Interactive Completion Trigger */}
                      <button
                        onClick={() => handleComplete(q.id)}
                        disabled={isCompleted || completingId === q.id}
                        className={`mt-0.5 shrink-0 rounded-lg p-1 transition-colors ${
                          isCompleted
                            ? "text-emerald-400 cursor-default"
                            : "text-slate-500 hover:text-amber-400 hover:bg-slate-800"
                        }`}
                        title={isCompleted ? "Completed today!" : "Click to complete quest"}
                        aria-label={`Mark quest ${q.title} as complete`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              q.difficulty === "EASY"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : q.difficulty === "MEDIUM"
                                ? "bg-blue-500/15 text-blue-400"
                                : q.difficulty === "HARD"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-purple-500/15 text-purple-400"
                            }`}
                          >
                            {q.difficulty}
                          </span>

                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <AttrIcon className="w-3 h-3 text-slate-400" />
                            {q.attributeType}
                          </span>

                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {q.estimatedMinutes}m
                          </span>
                        </div>

                        <h3
                          className={`text-sm font-bold text-slate-100 truncate ${
                            isCompleted ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {q.title}
                        </h3>

                        {q.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {q.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reward Tags */}
                    <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 text-xs font-mono">
                      <span className="text-sky-400 font-bold bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
                        +{q.difficulty === "EASY" ? 25 : q.difficulty === "MEDIUM" ? 50 : q.difficulty === "HARD" ? 100 : 250} XP
                      </span>
                      <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        +{q.difficulty === "EASY" ? 15 : q.difficulty === "MEDIUM" ? 35 : q.difficulty === "HARD" ? 80 : 200} G
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Daily Challenge & Attributes Panel */}
        <div className="space-y-6">
          {/* Daily Challenge Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-[#111827] border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Daily Challenge
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {Math.min(dailyGoalTarget, completedTodayCount)} / {dailyGoalTarget}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">Triumphant Trio</h3>
            <p className="text-xs text-slate-400 mb-4">
              Complete any 3 quests today to uphold your honor.
            </p>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (completedTodayCount / dailyGoalTarget) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">Bonus Reward:</span>
              <span className="font-mono font-bold text-amber-400">+100 XP • +50 Gold</span>
            </div>
          </div>

          {/* Core Attributes Card */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-white tracking-wide">
                Attributes Overview
              </h3>
              <Link href="/character" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                <span>View Sheet</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {attributes.map((attr) => {
                const Icon = ATTR_ICONS[attr.type] || Flame;
                const calc = getAttributeLevelFromXP(attr.currentXp);

                return (
                  <div key={attr.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-200">{attr.type}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        Lvl <strong className="text-amber-400">{calc.level}</strong> ({calc.percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${calc.percentage}%` }}
                      />
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
