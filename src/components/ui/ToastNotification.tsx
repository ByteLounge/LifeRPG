"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";

export function ToastNotification() {
  const { toastMessage } = useGame();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium backdrop-blur-md ${
            toastMessage.type === "success"
              ? "bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10"
              : toastMessage.type === "error"
              ? "bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-500/10"
              : "bg-slate-900/95 border-sky-500/50 text-sky-300 shadow-sky-500/10"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
