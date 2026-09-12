"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGame } from "@/components/providers/GameProvider";
import { DomainUserInventory } from "@/server/repositories/types";
import { soundEngine } from "@/lib/sound";

export default function InventoryPage() {
  const { refreshGameData, setTheme } = useGame();
  const [inventory, setInventory] = useState<DomainUserInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setInventory(json.data.inventory);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleToggleEquip = async (item: DomainUserInventory) => {
    if (equippingId) return;
    setEquippingId(item.id);

    const newEquippedState = !item.isEquipped;
    if (newEquippedState) {
      soundEngine.playPowerUp();
    } else {
      soundEngine.playPause();
    }

    try {
      const res = await fetch("/api/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInventoryId: item.id,
          isEquipped: newEquippedState,
        }),
      });

      if (res.ok) {
        if (item.item.type === "THEME") {
          setTheme(newEquippedState ? item.item.itemValue : "dark");
        }
        await fetchInventory();
        await refreshGameData();
      }
    } catch {
      soundEngine.playPowerDown();
    } finally {
      setEquippingId(null);
    }
  };

  const filteredItems = inventory.filter((item) => {
    if (filterType === "ALL") return true;
    return item.item.type === filterType;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="pixel-box-gold p-4 md:p-6 text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[9px] bg-red-600 text-white px-2 py-0.5 border border-black">
              YOUR BACKPACK
            </span>
          </div>
          <h1 className="font-pixel text-base sm:text-xl text-yellow-950 tracking-wider">
            MY ITEMS & BACKPACK
          </h1>
          <p className="font-retro text-xs text-yellow-900 mt-1">
            Equip and manage the badges, avatar frames, and themes you have unlocked.
          </p>
        </div>

        <Link
          href="/shop"
          onClick={() => soundEngine.playJump()}
          className="pixel-btn pixel-btn-red font-pixel text-[10px] px-4 py-2.5 flex items-center gap-2 shrink-0 self-start sm:self-auto text-white"
        >
          <span>🏪</span>
          <span>VISIT ITEM SHOP</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "AVATAR_FRAME", "TITLE", "THEME", "BADGE"].map((type) => (
          <button
            key={type}
            onClick={() => {
              soundEngine.playPause();
              setFilterType(type);
            }}
            className={`font-pixel text-[9px] px-3 py-2 border-2 transition-all ${
              filterType === type
                ? "bg-yellow-400 text-slate-950 border-black shadow-[3px_3px_0px_#000]"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-yellow-400"
            }`}
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

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 pixel-box bg-slate-900 animate-pulse border-2 border-slate-800" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="pixel-box p-12 bg-[#181824] border-2 border-dashed border-slate-700 text-center space-y-4">
          <div className="w-14 h-14 mx-auto question-block flex items-center justify-center font-pixel text-xl text-yellow-950">
            ?
          </div>
          <h3 className="font-pixel text-sm text-yellow-400">YOUR BACKPACK IS EMPTY!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-retro">
            Visit the Item Shop to buy cool frames, badges, and honorary titles with your earned coins.
          </p>
          <Link
            href="/shop"
            onClick={() => soundEngine.playCoin()}
            className="pixel-btn pixel-btn-yellow font-pixel text-[10px] px-4 py-2.5 inline-flex items-center gap-2"
          >
            <span>🪙</span>
            <span>OPEN ITEM SHOP</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((inv) => (
            <div
              key={inv.id}
              className={`pixel-box p-5 flex flex-col justify-between gap-4 transition-all ${
                inv.isEquipped
                  ? "bg-[#1f2937] border-2 border-yellow-400 shadow-[4px_4px_0px_#eab308]"
                  : "bg-[#181824] border-2 border-slate-700 hover:border-slate-500"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl select-none">{inv.item.icon}</span>
                  <div className="flex items-center gap-1.5">
                    {inv.isEquipped && (
                      <span className="font-pixel text-[8px] bg-yellow-400 text-slate-950 px-1.5 py-0.5 border border-black animate-pulse">
                        ★ EQUIPPED
                      </span>
                    )}
                    <span
                      className={`font-pixel text-[8px] uppercase px-1.5 py-0.5 border ${
                        inv.item.rarity === "COMMON"
                          ? "bg-slate-800 text-slate-300 border-slate-600"
                          : inv.item.rarity === "RARE"
                          ? "bg-blue-900/60 text-blue-300 border-blue-500"
                          : inv.item.rarity === "EPIC"
                          ? "bg-purple-900/60 text-purple-300 border-purple-500"
                          : "bg-amber-900/60 text-yellow-300 border-amber-500"
                      }`}
                    >
                      {inv.item.rarity}
                    </span>
                  </div>
                </div>

                <h3 className="font-pixel text-xs text-white mb-1.5">{inv.item.name}</h3>
                <p className="font-retro text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {inv.item.description}
                </p>
              </div>

              <div className="pt-3 border-t-2 border-slate-700 flex items-center justify-between">
                <span className="font-pixel text-[8px] text-yellow-500 uppercase">
                  {inv.item.type.replace("_", " ")}
                </span>

                <button
                  onClick={() => handleToggleEquip(inv)}
                  disabled={equippingId === inv.id}
                  className={`pixel-btn font-pixel text-[9px] px-3 py-1.5 ${
                    inv.isEquipped
                      ? "pixel-btn-red text-white"
                      : "pixel-btn-green text-white"
                  }`}
                >
                  {inv.isEquipped ? "UNEQUIP" : "EQUIP"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
