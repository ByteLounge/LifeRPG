"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Save,
  Loader2,
  BookOpen,
  Dumbbell,
  Flame,
  Palette,
  Heart,
  Users,
} from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { DomainQuest } from "@/server/repositories/types";
import { formatDate } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

const ATTR_ICONS: Record<string, typeof BookOpen> = {
  INTELLECT: BookOpen,
  STRENGTH: Dumbbell,
  DISCIPLINE: Flame,
  CREATIVITY: Palette,
  VITALITY: Heart,
  SOCIAL: Users,
};

export default function QuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { completeQuestOptimistic, refreshGameData } = useGame();

  const [quest, setQuest] = useState<DomainQuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  useEffect(() => {
    async function loadQuest() {
      try {
        const res = await fetch(`/api/quests/${resolvedParams.id}`);
        if (!res.ok) {
          setError("Task not found.");
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setQuest(json.data);
          setTitle(json.data.title);
          setDescription(json.data.description || "");
          setEstimatedMinutes(json.data.estimatedMinutes || 30);
        }
      } catch {
        setError("Failed to fetch task details.");
      } finally {
        setLoading(false);
      }
    }
    loadQuest();
  }, [resolvedParams.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/quests/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          estimatedMinutes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to update task.");
        return;
      }

      soundEngine.playCoin();
      setQuest(json.data);
      setSuccessMsg("Task updated successfully.");
    } catch {
      setError("Network error while updating task.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!quest) return;
    setCompleting(true);
    soundEngine.playCoin();
    const result = await completeQuestOptimistic(quest.id);
    if (result.success) {
      setQuest({ ...quest, status: quest.repeatType === "NONE" ? "COMPLETED" : quest.status, completedToday: true });
    }
    setCompleting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/quests/${resolvedParams.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/quests");
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="text-xs font-retro">Loading task details...</p>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white font-pixel">Task Not Found</h2>
        <p className="text-sm text-slate-400 font-retro">
          This task may have been removed or deleted.
        </p>
        <Link
          href="/quests"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline font-retro"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Tasks</span>
        </Link>
      </div>
    );
  }

  const isCompleted = quest.completedToday || quest.status === "COMPLETED";
  const AttrIcon = ATTR_ICONS[quest.attributeType] || Flame;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/quests"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors font-retro"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Tasks</span>
      </Link>

      <div className="pixel-box p-6 md:p-8 bg-[#181824] border-2 border-slate-700 shadow-xl space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded font-pixel ${
                quest.difficulty === "EASY"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : quest.difficulty === "MEDIUM"
                  ? "bg-blue-500/15 text-blue-400"
                  : quest.difficulty === "HARD"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-purple-500/15 text-purple-400"
              }`}
            >
              {quest.difficulty}
            </span>

            <span className="flex items-center gap-1 text-xs text-slate-300 font-medium px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-retro">
              <AttrIcon className="w-3.5 h-3.5 text-amber-400" />
              {quest.attributeType}
            </span>

            <span className="text-xs text-slate-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-retro">
              {quest.repeatType === "DAILY" ? "Daily Habit" : quest.repeatType === "WEEKLY" ? "Weekly Goal" : "One-Time Task"}
            </span>
          </div>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Completion Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold font-pixel text-[9px]">Rewards Upon Completion</div>
            <div className="text-sm text-white mt-0.5 font-pixel">
              <span className="text-sky-400 font-bold">
                +{quest.difficulty === "EASY" ? 25 : quest.difficulty === "MEDIUM" ? 50 : quest.difficulty === "HARD" ? 100 : 250} XP
              </span>
              {" • "}
              <span className="text-amber-400 font-bold">
                +{quest.difficulty === "EASY" ? 15 : quest.difficulty === "MEDIUM" ? 35 : quest.difficulty === "HARD" ? 80 : 200} Coins
              </span>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            className={`pixel-btn ${
              isCompleted
                ? "pixel-btn-green cursor-default"
                : "pixel-btn-yellow"
            } text-[9px] py-2 px-4`}
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCompleted ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
              </span>
            ) : (
              <span>Complete Task</span>
            )}
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border-2 border-emerald-800 text-emerald-300 text-xs font-retro">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-retro">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border-2 border-slate-800 text-slate-100 text-sm focus:border-amber-500 outline-none font-retro"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-retro">
              Notes & Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border-2 border-slate-800 text-slate-100 text-sm focus:border-amber-500 outline-none resize-none font-retro"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-retro">
              Estimated Duration (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
              className="w-full px-3.5 py-2 bg-slate-900 border-2 border-slate-800 text-slate-100 text-sm focus:border-amber-500 outline-none font-retro"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="pixel-btn pixel-btn-green text-[9px] py-2 px-4 text-white flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>

        <div className="text-[11px] text-slate-500 pt-4 border-t-2 border-slate-800 font-retro">
          Created on {formatDate(quest.createdAt)}
        </div>
      </div>
    </div>
  );
}
