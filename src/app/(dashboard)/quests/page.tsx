"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  BookOpen,
  Dumbbell,
  Flame,
  Palette,
  Heart,
  Users,
  ExternalLink,
} from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { DomainQuest } from "@/server/repositories/types";
import { CreateQuestModal } from "@/components/quests/CreateQuestModal";

const ATTR_ICONS: Record<string, typeof BookOpen> = {
  INTELLECT: BookOpen,
  STRENGTH: Dumbbell,
  DISCIPLINE: Flame,
  CREATIVITY: Palette,
  VITALITY: Heart,
  SOCIAL: Users,
};

export default function QuestsPage() {
  const { completeQuestOptimistic, refreshGameData } = useGame();

  const [quests, setQuests] = useState<DomainQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch("/api/quests");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setQuests(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleComplete = async (questId: string) => {
    if (completingId) return;
    setCompletingId(questId);

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

  const handleDelete = async (questId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you wish to banish this quest from your journal?")) return;

    try {
      const res = await fetch(`/api/quests/${questId}`, { method: "DELETE" });
      if (res.ok) {
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      }
    } catch {
      // ignore
    }
  };

  // Filter and search
  const filteredQuests = quests.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = difficultyFilter === "ALL" || q.difficulty === difficultyFilter;
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "COMPLETED"
        ? q.completedToday || q.status === "COMPLETED"
        : !q.completedToday && q.status === "ACTIVE";

    return matchesSearch && matchesDiff && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Quest Journal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize, prioritize, and conquer your active trials and routines.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Scribe New Quest</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quest log by keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:border-amber-500 outline-none"
          />
        </div>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#111827] border border-slate-800 text-slate-200 text-xs focus:border-amber-500 outline-none"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
          <option value="EPIC">Epic</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#111827] border border-slate-800 text-slate-200 text-xs focus:border-amber-500 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active / Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Quests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <Shield className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No matching quests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or scribe a brand new quest to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((q) => {
            const isCompleted = q.completedToday || q.status === "COMPLETED";
            const AttrIcon = ATTR_ICONS[q.attributeType] || Flame;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                  isCompleted
                    ? "bg-slate-900/40 border-emerald-500/30 opacity-75"
                    : "bg-[#111827] hover:bg-[#131d2e] border-slate-800 hover:border-slate-700 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
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

                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {q.repeatType === "DAILY" ? "Daily Habit" : q.repeatType === "WEEKLY" ? "Weekly" : "One-Time"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/quests/${q.id}`}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
                        title="View Quest Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(q.id, e)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Banish Quest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`text-base font-bold text-slate-100 ${
                      isCompleted ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {q.title}
                  </h3>

                  {q.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {q.description}
                    </p>
                  )}
                </div>

                {/* Footer / Complete Button & Rewards */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-sky-400 font-bold">
                      +{q.difficulty === "EASY" ? 25 : q.difficulty === "MEDIUM" ? 50 : q.difficulty === "HARD" ? 100 : 250} XP
                    </span>
                    <span className="text-amber-400 font-bold">
                      +{q.difficulty === "EASY" ? 15 : q.difficulty === "MEDIUM" ? 35 : q.difficulty === "HARD" ? 80 : 200} G
                    </span>
                  </div>

                  <button
                    onClick={() => handleComplete(q.id)}
                    disabled={isCompleted || completingId === q.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isCompleted
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-default"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm active:scale-95"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Fulfill Trial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
