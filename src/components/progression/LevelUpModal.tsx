"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, ArrowRight, X, Award } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";

export function LevelUpModal() {
  const { levelUpModalData, closeLevelUpModal } = useGame();

  if (!levelUpModalData) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-[#111827] border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={closeLevelUpModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Close Level Up modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Glowing Aura Accent */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Progression Milestone
          </div>

          <h2 id="levelup-title" className="text-3xl font-black tracking-tight text-white font-serif mb-1">
            LEVEL UP!
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Your real-world discipline has ascended your character!
          </p>

          {/* Level Transition Visual */}
          <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-xl bg-slate-900/80 border border-slate-800 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-slate-500 font-semibold">Previous</span>
              <span className="text-2xl font-bold text-slate-400">Lvl {levelUpModalData.oldLevel}</span>
            </div>

            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-amber-400"
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>

            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-amber-400 font-semibold">Ascended</span>
              <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                Lvl {levelUpModalData.newLevel}
              </span>
            </div>
          </div>

          {/* Rewards Received */}
          <div className="space-y-2 text-left mb-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rewards Granted</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-lg">✨</span>
                <div>
                  <div className="text-xs text-slate-400">Total XP Gained</div>
                  <div className="text-sm font-bold text-sky-400">+{levelUpModalData.xpEarned} XP</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-lg">🪙</span>
                <div>
                  <div className="text-xs text-slate-400">Gold Treasury</div>
                  <div className="text-sm font-bold text-amber-400">+{levelUpModalData.goldEarned} Gold</div>
                </div>
              </div>
            </div>

            {levelUpModalData.unlockedAchievements.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-purple-950/40 border border-purple-800/50 text-left">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  Achievement Unlocked!
                </div>
                {levelUpModalData.unlockedAchievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-200">
                    <span>{ach.icon}</span>
                    <span className="font-medium">{ach.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={closeLevelUpModal}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold tracking-wide shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Claim & Continue Questing
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
