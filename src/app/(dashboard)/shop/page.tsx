"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Store, Coins, Check, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { formatNumber } from "@/lib/utils";

interface ShopItemCatalog {
  id: string;
  name: string;
  description: string;
  type: "AVATAR_FRAME" | "THEME" | "TITLE" | "BADGE";
  price: number;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  itemValue: string;
  isOwned: boolean;
  canAfford: boolean;
}

export default function ShopPage() {
  const { character, refreshGameData, spendGoldOptimistic, setToast } = useGame();

  const [items, setItems] = useState<ShopItemCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/shop");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setItems(json.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handlePurchase = async (item: ShopItemCatalog) => {
    if (purchasingId) return;
    if (item.isOwned) return;

    if ((character?.gold || 0) < item.price) {
      setToast({
        text: `Insufficient gold! You need ${item.price} Gold, but currently possess ${character?.gold || 0} Gold.`,
        type: "error",
      });
      return;
    }

    setPurchasingId(item.id);

    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ text: json.error?.message || "Purchase failed.", type: "error" });
        return;
      }

      spendGoldOptimistic(item.price);
      setToast({ text: `Successfully acquired ${item.name}! Added to your inventory.`, type: "success" });
      await fetchCatalog();
      await refreshGameData();
    } catch {
      setToast({ text: "Network error during transaction.", type: "error" });
    } finally {
      setPurchasingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Treasury Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
            <Store className="w-6 h-6 text-amber-400" />
            <span>Merchant&apos;s Bazaar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exchange your earned quest spoils for cosmetic crests, titles, and themes.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm flex items-center gap-2 shadow-sm w-fit">
          <Coins className="w-5 h-5 text-amber-400" />
          <span>Available: {formatNumber(character?.gold || 0)} Gold</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "AVATAR_FRAME", "TITLE", "THEME", "BADGE"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === type
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {type === "ALL"
              ? "All Goods"
              : type === "AVATAR_FRAME"
              ? "Avatar Frames"
              : type === "TITLE"
              ? "Honorary Titles"
              : type === "THEME"
              ? "Themes"
              : "Badges"}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const canAfford = (character?.gold || 0) >= item.price;
            const isPurchasing = purchasingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  item.isOwned
                    ? "bg-slate-900/40 border-slate-800/80 opacity-80"
                    : "bg-[#111827] hover:bg-[#131d2e] border-slate-800 hover:border-amber-500/40 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.rarity === "COMMON"
                          ? "bg-slate-800 text-slate-400"
                          : item.rarity === "RARE"
                          ? "bg-blue-500/15 text-blue-400"
                          : item.rarity === "EPIC"
                          ? "bg-purple-500/15 text-purple-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400">
                    <Coins className="w-4 h-4" />
                    <span>{item.price} G</span>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={item.isOwned || !canAfford || isPurchasing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      item.isOwned
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-default"
                        : canAfford
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isPurchasing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : item.isOwned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Owned</span>
                      </>
                    ) : canAfford ? (
                      <span>Acquire</span>
                    ) : (
                      <span>Need Gold</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
