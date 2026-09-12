"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/components/providers/GameProvider";

export function ToastNotification() {
  const { toastMessage } = useGame();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 pointer-events-none font-pixel">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className={`flex items-center gap-3 px-4 py-3 border-4 border-black text-[10px] tracking-wide shadow-[0_6px_0_0_#000] ${
            toastMessage.type === "success"
              ? "bg-[#00A800] text-white"
              : toastMessage.type === "error"
              ? "bg-[#E52521] text-white"
              : "bg-[#5C94FC] text-black"
          }`}
        >
          <span className="text-sm">
            {toastMessage.type === "success" ? "🍄" : toastMessage.type === "error" ? "💥" : "⭐"}
          </span>
          <span className="font-bold">{toastMessage.text.toUpperCase()}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
