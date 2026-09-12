"use client";

import React, { useState } from "react";
import { X, Sparkles, Loader2, Shield, Calendar, Clock, BookOpen, Dumbbell, Flame, Palette, Heart, Users } from "lucide-react";
import { QuestDifficulty, AttributeType } from "@/lib/game-engine/progression";

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestCreated: () => void;
}

const ATTRIBUTES: Array<{ id: AttributeType; label: string; icon: typeof BookOpen }> = [
  { id: "DISCIPLINE", label: "Discipline", icon: Flame },
  { id: "INTELLECT", label: "Intellect", icon: BookOpen },
  { id: "STRENGTH", label: "Strength", icon: Dumbbell },
  { id: "CREATIVITY", label: "Creativity", icon: Palette },
  { id: "VITALITY", label: "Vitality", icon: Heart },
  { id: "SOCIAL", label: "Social", icon: Users },
];

const DIFFICULTIES: Array<{ id: QuestDifficulty; label: string; xp: number; gold: number; color: string }> = [
  { id: "EASY", label: "Easy", xp: 25, gold: 15, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  { id: "MEDIUM", label: "Medium", xp: 50, gold: 35, color: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  { id: "HARD", label: "Hard", xp: 100, gold: 80, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  { id: "EPIC", label: "Epic", xp: 250, gold: 200, color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
];

export function CreateQuestModal({ isOpen, onClose, onQuestCreated }: CreateQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Daily Routine");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("MEDIUM");
  const [attributeType, setAttributeType] = useState<AttributeType>("DISCIPLINE");
  const [repeatType, setRepeatType] = useState<"NONE" | "DAILY" | "WEEKLY">("DAILY");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Quest title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          difficulty,
          attributeType,
          estimatedMinutes,
          repeatType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to scribe quest.");
        return;
      }

      setTitle("");
      setDescription("");
      onQuestCreated();
      onClose();
    } catch {
      setError("Network error while scribing quest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          Quest Registry
        </div>
        <h3 id="modal-title" className="text-xl font-bold font-serif text-white mb-4">
          Scribe New Quest
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quest Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 pages of Systems Design"
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or specific acceptance criteria..."
              rows={2}
              maxLength={500}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:border-amber-500 outline-none resize-none"
            />
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Challenge Difficulty & Server Rewards
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    difficulty === d.id
                      ? `${d.color} ring-1 ring-amber-400 font-bold shadow-sm`
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{d.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    +{d.xp} XP • +{d.gold} G
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Attribute Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Governing Attribute
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ATTRIBUTES.map((attr) => {
                const Icon = attr.icon;
                const isSelected = attributeType === attr.id;
                return (
                  <button
                    type="button"
                    key={attr.id}
                    onClick={() => setAttributeType(attr.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{attr.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cadence
              </label>
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as "NONE" | "DAILY" | "WEEKLY")}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 outline-none"
              >
                <option value="DAILY">Daily Habit (Resets daily)</option>
                <option value="NONE">One-Time Quest</option>
                <option value="WEEKLY">Weekly Objective</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Est. Minutes
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Commit to Quest Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
