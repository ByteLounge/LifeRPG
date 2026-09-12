"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGame } from "@/components/providers/GameProvider";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";

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
      soundEngine.playJump();
      setToast({
        text: `NEED MORE COINS! PRICE: ${item.price} G, YOU HAVE: ${character?.gold || 0} G`,
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
        setToast({ text: json.error?.message || "PURCHASE FAILED.", type: "error" });
        return;
      }

      soundEngine.playCoin();
      spendGoldOptimistic(item.price);
      setToast({ text: `ACQUIRED ${item.name}! STORED IN BAG.`, type: "success" });
      await fetchCatalog();
      await refreshGameData();
    } catch {
      setToast({ text: "WARP ERROR DURING PURCHASE.", type: "error" });
    } finally {
      setPurchasingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none font-pixel">
      {/* Toad's Shop Header Banner */}
      <div className="p-6 bg-[#E52521] border-4 border-black text-white shadow-[0_6px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[9px] text-[#FBD000] font-bold">★ TOAD&apos;S ITEM SHOP ★</div>
          <h1 className="text-lg md:text-2xl font-black drop-shadow-[2px_2px_0_#000]">
            POWER-UP BAZAAR
          </h1>
          <p className="font-retro text-xs text-white/90">
            Trade your hard-earned gold coins for cosmetic frames and prestige titles!
          </p>
        </div>

        <div className="p-3 bg-black border-2 border-white shadow-[2px_2px_0_#000] flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xl pixel-coin-spin">🪙</span>
          <div>
            <div className="text-[8px] text-[#A0A0B0]">COIN PURSE</div>
            <div className="text-sm font-bold text-[#FBD000]">
              {formatNumber(character?.gold || 0)} G
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "AVATAR_FRAME", "TITLE", "THEME", "BADGE"].map((type) => (
          <button
            key={type}
            onClick={() => {
              soundEngine.playJump();
              setFilterType(type);
            }}
            className={`pixel-btn ${
              filterType === type ? "pixel-btn-gold" : "pixel-btn-dark"
            } text-[8px] py-2 px-3`}
          >
            {type === "ALL"
              ? "ALL ITEMS"
              : type === "AVATAR_FRAME"
              ? "FRAMES"
              : type === "TITLE"
              ? "TITLES"
              : type === "THEME"
              ? "THEMES"
              : "BADGES"}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-[#202030] border-4 border-black animate-pulse" />
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
                className={`p-5 border-4 border-black transition-all flex flex-col justify-between gap-3 ${
                  item.isOwned
                    ? "bg-[#141420] opacity-70"
                    : "bg-[#202030] hover:bg-[#282838] shadow-[0_5px_0_#000]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span
                      className={`text-[7px] font-bold px-1.5 py-0.5 border border-black ${
                        item.rarity === "COMMON"
                          ? "bg-slate-700 text-white"
                          : item.rarity === "RARE"
                          ? "bg-[#5C94FC] text-black"
                          : item.rarity === "EPIC"
                          ? "bg-[#EC4899] text-white"
                          : "bg-[#FBD000] text-black"
                      }`}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1">{item.name.toUpperCase()}</h3>
                  <p className="font-retro text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t-2 border-black flex items-center justify-between text-[9px]">
                  <div className="text-[#FBD000] font-bold flex items-center gap-1">
                    <span className="pixel-coin-spin">🪙</span>
                    <span>{item.price} G</span>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={item.isOwned || !canAfford || isPurchasing}
                    className={`pixel-btn ${
                      item.isOwned
                        ? "pixel-btn-dark opacity-60 cursor-default"
                        : canAfford
                        ? "pixel-btn-gold"
                        : "pixel-btn-dark opacity-50 cursor-not-allowed"
                    } text-[8px] py-1.5 px-2.5`}
                  >
                    {isPurchasing ? "..." : item.isOwned ? "✓ OWNED" : canAfford ? "★ BUY" : "NEED G"}
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
