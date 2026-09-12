"use client";

import React, { useState, useEffect, useCallback } from "react";
import { History, Shield, Sparkles, Coins, Trophy, ShoppingBag, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "QUEST_COMPLETED" | "LEVEL_UP" | "ACHIEVEMENT_UNLOCKED" | "SHOP_PURCHASE";
  title: string;
  description: string;
  xpEarned?: number;
  goldEarned?: number;
  timestamp: string;
}

export default function HistoryPage() {
  const [ledger, setLedger] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/history?limit=30");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLedger(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
          <History className="w-6 h-6 text-amber-400" />
          <span>Chronicles & Audit Ledger</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authoritative chronological record of all quest milestones, XP growth, and treasury debits.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : ledger.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Your chronicles have just begun</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As you fulfill trials, level up, and trade at the bazaar, your ledger will record every milestone.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ledger.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between gap-4 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 ${
                    item.type === "QUEST_COMPLETED"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : item.type === "LEVEL_UP"
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                      : item.type === "ACHIEVEMENT_UNLOCKED"
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-400"
                      : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                  }`}
                >
                  {item.type === "QUEST_COMPLETED" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.type === "LEVEL_UP" ? (
                    <Sparkles className="w-4 h-4" />
                  ) : item.type === "ACHIEVEMENT_UNLOCKED" ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[11px] text-slate-500 font-mono">
                  {formatDateTime(item.timestamp)}
                </div>
                {item.xpEarned && item.xpEarned > 0 && (
                  <div className="text-xs font-mono font-bold text-sky-400">+{item.xpEarned} XP</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
