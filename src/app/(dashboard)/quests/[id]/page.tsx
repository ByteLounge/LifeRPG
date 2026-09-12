"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Clock,
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
          setError("Quest not found.");
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
        setError("Failed to fetch quest details.");
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
        setError(json.error?.message || "Failed to update quest.");
        return;
      }

      setQuest(json.data);
      setSuccessMsg("Quest updated successfully.");
    } catch {
      setError("Network error while updating quest.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!quest) return;
    setCompleting(true);
    const result = await completeQuestOptimistic(quest.id);
    if (result.success) {
      setQuest({ ...quest, status: quest.repeatType === "NONE" ? "COMPLETED" : quest.status, completedToday: true });
    }
    setCompleting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you wish to banish this quest?")) return;
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
        <p className="text-xs">Consulting the archives...</p>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Quest Not Found</h2>
        <p className="text-sm text-slate-400">
          This trial may have been archived or banished into the ether.
        </p>
        <Link
          href="/quests"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Quest Journal</span>
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Quest Journal</span>
      </Link>

      <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                quest.difficulty === "EASY"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : quest.difficulty === "MEDIUM"
                  ? "bg-blue-500/15 text-blue-400"
                  : quest.difficulty === "HARD"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-purple-500/15 text-purple-400"
              }`}
            >
              {quest.difficulty} Challenge
            </span>

            <span className="flex items-center gap-1 text-xs text-slate-300 font-medium px-2.5 py-1 rounded bg-slate-800">
              <AttrIcon className="w-3.5 h-3.5 text-amber-400" />
              {quest.attributeType}
            </span>

            <span className="text-xs text-slate-400 px-2.5 py-1 rounded bg-slate-800 font-mono">
              {quest.repeatType === "DAILY" ? "Daily Habit" : quest.repeatType === "WEEKLY" ? "Weekly" : "One-Time"}
            </span>
          </div>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Banish Quest"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Completion Action Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Reward Guarantee</div>
            <div className="text-sm font-mono text-white mt-0.5">
              <span className="text-sky-400 font-bold">
                +{quest.difficulty === "EASY" ? 25 : quest.difficulty === "MEDIUM" ? 50 : quest.difficulty === "HARD" ? 100 : 250} XP
              </span>
              {" • "}
              <span className="text-amber-400 font-bold">
                +{quest.difficulty === "EASY" ? 15 : quest.difficulty === "MEDIUM" ? 35 : quest.difficulty === "HARD" ? 80 : 200} Gold
              </span>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide flex items-center gap-2 transition-all ${
              isCompleted
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 cursor-default"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95"
            }`}
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Trial Completed</span>
              </>
            ) : (
              <span>Fulfill Trial & Claim Rewards</span>
            )}
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quest Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Estimated Duration (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Revisions</span>
            </button>
          </div>
        </form>

        <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800">
          Scribed on {formatDate(quest.createdAt)}
        </div>
      </div>
    </div>
  );
}
