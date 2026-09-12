"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/components/providers/GameProvider";
import { soundEngine } from "@/lib/sound";

export function LevelUpModal() {
  const { levelUpModalData, closeLevelUpModal } = useGame();

  if (!levelUpModalData) return null;

  const handleClaim = () => {
    soundEngine.playCoin();
    closeLevelUpModal();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative w-full max-w-md p-6 bg-[#202030] border-4 border-black shadow-[inset_-6px_-6px_0px_0px_#101018,inset_6px_6px_0px_0px_#FBD000,0_10px_0px_0px_#000] text-center text-white font-pixel"
        >
          {/* Top Banner Tag */}
          <div className="inline-block bg-[#E52521] border-2 border-black px-3 py-1 text-[10px] text-white font-bold mb-4 shadow-[2px_2px_0_#000]">
            ★ COURSE CLEAR! ★
          </div>

          <h2 id="levelup-title" className="text-2xl font-black text-[#FBD000] drop-shadow-[3px_3px_0_#000] mb-2">
            LEVEL UP!
          </h2>

          <p className="text-[10px] text-[#A0A0B0] mb-6 leading-relaxed">
            SUPER DISCIPLINE HAS ASCENDED YOUR STATS!
          </p>

          {/* Level Transition Box */}
          <div className="flex items-center justify-center gap-4 py-4 px-4 bg-[#101018] border-4 border-black mb-6 shadow-[inset_0_4px_0_#000]">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#808090]">FROM</span>
              <span className="text-lg font-bold text-white">LVL {levelUpModalData.oldLevel}</span>
            </div>

            <span className="text-xl text-[#FBD000] animate-pulse">▶▶</span>

            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#FBD000]">ASCENDED</span>
              <span className="text-2xl font-black text-[#00E800] drop-shadow-[2px_2px_0_#000]">
                LVL {levelUpModalData.newLevel}
              </span>
            </div>
          </div>

          {/* Spoil Rewards */}
          <div className="space-y-3 text-left mb-6 font-pixel">
            <div className="text-[9px] text-[#FBD000] uppercase">★ SPOILS AWARDED ★</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#181824] border-2 border-black flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <div className="text-[8px] text-[#808090]">EXP BONUS</div>
                  <div className="text-[10px] text-[#5C94FC] font-bold">+{levelUpModalData.xpEarned} XP</div>
                </div>
              </div>
              <div className="p-3 bg-[#181824] border-2 border-black flex items-center gap-2.5">
                <span className="text-xl pixel-coin-spin">🪙</span>
                <div>
                  <div className="text-[8px] text-[#808090]">GOLD COINS</div>
                  <div className="text-[10px] text-[#FBD000] font-bold">+{levelUpModalData.goldEarned} G</div>
                </div>
              </div>
            </div>

            {levelUpModalData.unlockedAchievements.length > 0 && (
              <div className="p-3 bg-[#281828] border-2 border-black text-left">
                <div className="text-[9px] text-[#EC4899] font-bold mb-1">
                  ⭐ STAR MEDAL UNLOCKED!
                </div>
                {levelUpModalData.unlockedAchievements.map((ach, idx) => (
                  <div key={idx} className="text-[9px] text-white flex items-center gap-2">
                    <span>{ach.icon}</span>
                    <span>{ach.name.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleClaim}
            className="pixel-btn pixel-btn-gold w-full text-xs py-3"
          >
            ★ CLAIM & CONTINUE ★
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
