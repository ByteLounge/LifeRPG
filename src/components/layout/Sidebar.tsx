"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Compass,
  User,
  Backpack,
  Store,
  Trophy,
  History,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Command Center", icon: Compass },
  { href: "/quests", label: "Quest Journal", icon: Shield },
  { href: "/character", label: "Character Sheet", icon: User },
  { href: "/inventory", label: "Inventory", icon: Backpack },
  { href: "/shop", label: "Bazaar & Shop", icon: Store },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/history", label: "Audit Ledger", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { character, profile } = useGame();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0c121e] text-slate-200 select-none shrink-0 h-screen sticky top-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-rpg-gold">
          <Sparkles className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="font-serif font-black tracking-wider text-base text-white">LIFE RPG</h1>
          <p className="text-[11px] text-amber-400 font-medium tracking-wide">FORGED PRODUCTIVITY</p>
        </div>
      </div>

      {/* User Hero Mini-Badge */}
      {character && (
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-amber-500/40 flex items-center justify-center text-lg font-bold text-amber-400">
            ⚔️
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-100 truncate">{character.name}</div>
            <div className="text-xs text-slate-400">
              Level <span className="text-amber-400 font-semibold">{character.level}</span> Hero
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Realm</span>
        </button>
      </div>
    </aside>
  );
}
