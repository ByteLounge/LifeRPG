"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Backpack, Sparkles, Check, Store, Shield, Tag } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { DomainUserInventory } from "@/server/repositories/types";

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
      // ignore
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
            <Backpack className="w-6 h-6 text-amber-400" />
            <span>Adventurer&apos;s Backpack</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your owned frames, honorary titles, and realm themes.
          </p>
        </div>

        <Link
          href="/shop"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-semibold text-xs flex items-center gap-2 transition-colors w-fit"
        >
          <Store className="w-4 h-4" />
          <span>Visit Bazaar Shop</span>
        </Link>
      </div>

      {/* Category Tabs */}
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
              ? "All Items"
              : type === "AVATAR_FRAME"
              ? "Avatar Frames"
              : type === "TITLE"
              ? "Titles"
              : type === "THEME"
              ? "Themes"
              : "Badges"}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <Backpack className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Your inventory is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Acquire cosmetic items, avatar frames, and honorary titles in the virtual shop using your earned gold.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Open Shop Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((inv) => (
            <div
              key={inv.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                inv.isEquipped
                  ? "bg-slate-900 border-amber-500/60 shadow-rpg-gold"
                  : "bg-[#111827] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{inv.item.icon}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      inv.item.rarity === "COMMON"
                        ? "bg-slate-800 text-slate-400"
                        : inv.item.rarity === "RARE"
                        ? "bg-blue-500/15 text-blue-400"
                        : inv.item.rarity === "EPIC"
                        ? "bg-purple-500/15 text-purple-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {inv.item.rarity}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{inv.item.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{inv.item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-mono">
                  {inv.item.type.replace("_", " ")}
                </span>

                <button
                  onClick={() => handleToggleEquip(inv)}
                  disabled={equippingId === inv.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inv.isEquipped
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40"
                      : "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  }`}
                >
                  {inv.isEquipped ? "Equipped (Click to Unequip)" : "Equip"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
