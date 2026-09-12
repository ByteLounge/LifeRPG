"use client";

import React, { useState } from "react";
import { QuestDifficulty, AttributeType } from "@/lib/game-engine/progression";
import { soundEngine } from "@/lib/sound";

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestCreated: () => void;
}

const ATTRIBUTES: Array<{ id: AttributeType; label: string; icon: string }> = [
  { id: "INTELLECT", label: "INTELLECT", icon: "🧠" },
  { id: "STRENGTH", label: "STRENGTH", icon: "💥" },
  { id: "DISCIPLINE", label: "DISCIPLINE", icon: "🔥" },
  { id: "CREATIVITY", label: "CREATIVITY", icon: "🎨" },
  { id: "VITALITY", label: "VITALITY", icon: "❤️" },
  { id: "SOCIAL", label: "SOCIAL", icon: "🤝" },
];

const DIFFICULTIES: Array<{ id: QuestDifficulty; label: string; xp: number; gold: number; colorClass: string }> = [
  { id: "EASY", label: "EASY", xp: 25, gold: 15, colorClass: "pixel-btn-green" },
  { id: "MEDIUM", label: "MEDIUM", xp: 50, gold: 35, colorClass: "pixel-btn-blue" },
  { id: "HARD", label: "HARD", xp: 100, gold: 80, colorClass: "pixel-btn-gold" },
  { id: "EPIC", label: "EPIC", xp: 250, gold: 200, colorClass: "pixel-btn-red" },
];

export function CreateQuestModal({ isOpen, onClose, onQuestCreated }: CreateQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Daily Habits");
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
      setError("Task title cannot be blank!");
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
        setError(json.error?.message || "Failed to create task.");
        return;
      }

      soundEngine.playCoin();
      setTitle("");
      setDescription("");
      onQuestCreated();
      onClose();
    } catch {
      setError("Network connection error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-pixel select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg p-6 bg-[#202030] border-4 border-black shadow-[inset_-4px_-4px_0_#101018,inset_4px_4px_0_#383848,0_10px_0_#000] text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine.playJump();
            onClose();
          }}
          className="absolute top-4 right-4 pixel-btn pixel-btn-red text-[10px] py-1 px-2"
        >
          ✕
        </button>

        <div className="text-[9px] text-[#FBD000] uppercase mb-1">
          ★ NEW TASK ENTRY ★
        </div>
        <h3 className="text-sm md:text-base font-black text-white mb-4">
          CREATE A NEW TASK
        </h3>

        {error && (
          <div className="mb-4 p-2.5 bg-[#E52521] border-2 border-black text-white text-[9px]">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-[10px]">
          <div>
            <label className="block text-[#A0A0B0] mb-1.5 font-retro">TASK NAME *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study coding for 1 hour"
              maxLength={120}
              className="w-full px-3 py-2.5 bg-[#101018] border-2 border-black text-white placeholder-slate-600 font-retro text-xs outline-none focus:border-[#FBD000]"
            />
          </div>

          <div>
            <label className="block text-[#A0A0B0] mb-1.5 font-retro">NOTES OR DETAILS (OPTIONAL)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chapter 4 and practice problems..."
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 bg-[#101018] border-2 border-black text-white placeholder-slate-600 font-retro text-xs outline-none focus:border-[#FBD000] resize-none"
            />
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-[#A0A0B0] mb-1.5 font-retro">DIFFICULTY & REWARDS</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => {
                    soundEngine.playJump();
                    setDifficulty(d.id);
                  }}
                  className={`pixel-btn ${
                    difficulty === d.id ? d.colorClass : "pixel-btn-dark opacity-60"
                  } text-[8px] py-2 px-1 flex flex-col items-center justify-center`}
                >
                  <span className="font-bold">{d.label}</span>
                  <span className="text-[7px] mt-0.5">+{d.xp} XP / +{d.gold} Coins</span>
                </button>
              ))}
            </div>
          </div>

          {/* Governing Attribute */}
          <div>
            <label className="block text-[#A0A0B0] mb-1.5 font-retro">SKILL TO LEVEL UP</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ATTRIBUTES.map((attr) => (
                <button
                  type="button"
                  key={attr.id}
                  onClick={() => {
                    soundEngine.playJump();
                    setAttributeType(attr.id);
                  }}
                  className={`pixel-btn ${
                    attributeType === attr.id ? "pixel-btn-gold text-black" : "pixel-btn-dark"
                  } text-[8px] py-2 px-2 flex items-center gap-1.5`}
                >
                  <span>{attr.icon}</span>
                  <span className="truncate">{attr.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0A0B0] mb-1.5 font-retro">HOW OFTEN?</label>
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as "NONE" | "DAILY" | "WEEKLY")}
                className="w-full px-2 py-2 bg-[#101018] border-2 border-black text-white font-retro text-xs outline-none"
              >
                <option value="DAILY">DAILY HABIT</option>
                <option value="NONE">ONE-TIME TO-DO</option>
                <option value="WEEKLY">WEEKLY GOAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A0A0B0] mb-1.5 font-retro">ESTIMATED MINUTES</label>
              <input
                type="number"
                min={1}
                max={720}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
                className="w-full px-2 py-2 bg-[#101018] border-2 border-black text-white font-retro text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playJump();
                onClose();
              }}
              className="pixel-btn pixel-btn-dark flex-1 text-[9px] py-2.5"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-green flex-1 text-[9px] py-2.5 text-white"
            >
              {loading ? "SAVING..." : "★ SAVE TASK ★"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
