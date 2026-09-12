"use client";

import React, { useState, useEffect, useCallback } from "react";
import { History, Shield, Sparkles, Coins, Trophy, ShoppingBag, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

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
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/history?limit=40");
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

  const filteredLedger = ledger.filter((item) => {
    if (filter === "ALL") return true;
    return item.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 8-bit NES Arcade Chronicle Header */}
      <div className="pixel-box-green p-4 md:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[9px] bg-yellow-400 text-slate-950 px-2 py-0.5 border border-black font-bold">
              ARCADE LEDGER
            </span>
            <span className="font-pixel text-[9px] text-emerald-200">WORLD CHRONICLES</span>
          </div>
          <h1 className="font-pixel text-base sm:text-xl text-yellow-300 tracking-wider">
            HIGH-SCORE AUDIT & LOG
          </h1>
          <p className="font-retro text-xs text-emerald-100 mt-1">
            Authoritative chronological record of all quest completions, 1-UPs, and bazaar trades.
          </p>
        </div>

        <div className="font-pixel text-xs bg-emerald-950 px-3 py-2 border-2 border-emerald-400 text-emerald-300 w-fit">
          {ledger.length} ENTRIES RECORDED
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "ALL", label: "★ ALL EVENTS" },
          { id: "QUEST_COMPLETED", label: "🚩 QUESTS" },
          { id: "LEVEL_UP", label: "🍄 1-UPs" },
          { id: "ACHIEVEMENT_UNLOCKED", label: "⭐ STARS" },
          { id: "SHOP_PURCHASE", label: "🏪 SHOP" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundEngine.playPause();
              setFilter(tab.id);
            }}
            className={`font-pixel text-[9px] px-3 py-2 border-2 transition-all ${
              filter === tab.id
                ? "bg-yellow-400 text-slate-950 border-black shadow-[3px_3px_0px_#000]"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-yellow-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 pixel-box bg-slate-900 animate-pulse border-2 border-slate-800" />
          ))}
        </div>
      ) : filteredLedger.length === 0 ? (
        <div className="pixel-box p-12 bg-[#181824] border-2 border-dashed border-slate-700 text-center space-y-3">
          <div className="text-3xl">📜</div>
          <h3 className="font-pixel text-sm text-yellow-400">NO CHRONICLE ENTRIES YET!</h3>
          <p className="font-retro text-xs text-slate-400 max-w-sm mx-auto">
            As you fulfill quest trials, level up, and trade at Toad&apos;s shop, your ledger will record
            every milestone.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLedger.map((item) => (
            <div
              key={item.id}
              onClick={() => soundEngine.playPause()}
              className="pixel-box p-4 bg-[#181824] border-2 border-slate-700 flex items-center justify-between gap-4 cursor-pointer hover:border-yellow-400 transition-all select-none"
            >
              <div className="flex items-center gap-3.5">
                {/* 8-bit Icon Badge */}
                <div
                  className={`w-10 h-10 border-2 border-black flex items-center justify-center text-lg shrink-0 ${
                    item.type === "QUEST_COMPLETED"
                      ? "bg-emerald-500 text-white"
                      : item.type === "LEVEL_UP"
                      ? "bg-red-500 text-white"
                      : item.type === "ACHIEVEMENT_UNLOCKED"
                      ? "bg-yellow-400 text-slate-950"
                      : "bg-sky-500 text-white"
                  }`}
                >
                  {item.type === "QUEST_COMPLETED"
                    ? "🚩"
                    : item.type === "LEVEL_UP"
                    ? "🍄"
                    : item.type === "ACHIEVEMENT_UNLOCKED"
                    ? "⭐"
                    : "🪙"}
                </div>

                <div>
                  <h4 className="font-pixel text-xs text-white tracking-wide">{item.title}</h4>
                  <p className="font-retro text-xs text-slate-300 mt-0.5">{item.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-pixel text-[9px] text-slate-400">
                  {formatDateTime(item.timestamp)}
                </div>
                {item.xpEarned && item.xpEarned > 0 && (
                  <div className="font-pixel text-[10px] text-yellow-400 mt-0.5">
                    +{item.xpEarned} XP
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
