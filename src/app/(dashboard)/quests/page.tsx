"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGame } from "@/components/providers/GameProvider";
import { DomainQuest } from "@/server/repositories/types";
import { CreateQuestModal } from "@/components/quests/CreateQuestModal";
import { soundEngine } from "@/lib/sound";

const ATTR_INFO: Record<string, { label: string; icon: string }> = {
  INTELLECT: { label: "Intellect", icon: "🧠" },
  STRENGTH: { label: "Strength", icon: "💥" },
  DISCIPLINE: { label: "Discipline", icon: "🔥" },
  CREATIVITY: { label: "Creativity", icon: "🎨" },
  VITALITY: { label: "Vitality", icon: "❤️" },
  SOCIAL: { label: "Social", icon: "🤝" },
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

  const handleDelete = async (questId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playJump();
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/quests/${questId}`, { method: "DELETE" });
      if (res.ok) {
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      }
    } catch {
      // ignore
    }
  };

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
    <div className="space-y-6 select-none font-pixel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-black">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#FBD000] drop-shadow-[2px_2px_0_#000] flex items-center gap-2.5">
            <span>✅ TASKS & HABITS</span>
          </h1>
          <p className="font-retro text-xs text-slate-400 mt-1">
            Track and complete your daily habits, study goals, and to-dos.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playJump();
            setIsCreateModalOpen(true);
          }}
          className="pixel-btn pixel-btn-green text-[10px] py-2.5 px-4"
        >
          + NEW TASK
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 font-retro">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks by name..."
          className="flex-1 px-3 py-2.5 bg-[#101018] border-2 border-black text-white placeholder-slate-600 text-xs outline-none focus:border-[#FBD000]"
        />

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#202030] border-2 border-black text-white text-xs outline-none"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
          <option value="EPIC">Epic</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#202030] border-2 border-black text-white text-xs outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="COMPLETED">Completed Only</option>
        </select>
      </div>

      {/* Quests Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#202030] border-2 border-black animate-pulse" />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="p-12 pixel-box text-center space-y-3">
          <span className="text-3xl">🍄</span>
          <h3 className="text-xs font-bold text-white">NO TASKS FOUND</h3>
          <p className="font-retro text-xs text-slate-400">Try changing your search or filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((q) => {
            const isCompleted = q.completedToday || q.status === "COMPLETED";
            const attr = ATTR_INFO[q.attributeType] || { label: q.attributeType, icon: "⚔️" };

            return (
              <div
                key={q.id}
                className={`p-5 border-4 border-black transition-all flex flex-col justify-between gap-4 ${
                  isCompleted
                    ? "bg-[#102014] shadow-[0_3px_0_#000] opacity-80"
                    : "bg-[#202030] hover:bg-[#282838] shadow-[0_5px_0_#000]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                        {attr.icon} {attr.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/quests/${q.id}`}
                        onClick={() => soundEngine.playJump()}
                        className="pixel-btn pixel-btn-dark text-[8px] py-1 px-1.5"
                        title="View Task Details"
                      >
                        🔍
                      </Link>
                      <button
                        onClick={(e) => handleDelete(q.id, e)}
                        className="pixel-btn pixel-btn-red text-[8px] py-1 px-1.5"
                        title="Delete Task"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`text-xs font-bold ${
                      isCompleted ? "line-through text-[#608060]" : "text-white"
                    }`}
                  >
                    {q.title}
                  </h3>

                  {q.description && (
                    <p className="font-retro text-xs text-slate-400 mt-1 line-clamp-2">
                      {q.description}
                    </p>
                  )}
                </div>

                {/* Footer Complete Action */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-black text-[9px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-[#5C94FC]">
                      +{q.difficulty === "EASY" ? 25 : q.difficulty === "MEDIUM" ? 50 : q.difficulty === "HARD" ? 100 : 250} XP
                    </span>
                    <span className="text-[#FBD000] flex items-center gap-0.5">
                      <span className="pixel-coin-spin">🪙</span>
                      <span>+{q.difficulty === "EASY" ? 15 : q.difficulty === "MEDIUM" ? 35 : q.difficulty === "HARD" ? 80 : 200}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleComplete(q.id)}
                    disabled={isCompleted || completingId === q.id}
                    className={`pixel-btn ${
                      isCompleted ? "pixel-btn-dark opacity-60 cursor-default" : "pixel-btn-gold"
                    } text-[8px] py-1.5 px-3`}
                  >
                    {isCompleted ? "✓ COMPLETED" : "★ COMPLETE ★"}
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
