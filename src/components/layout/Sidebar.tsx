"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame } from "@/components/providers/GameProvider";
import { useRouter } from "next/navigation";
import { soundEngine } from "@/lib/sound";

const NAV_ITEMS = [
  { href: "/dashboard", label: "DASHBOARD", icon: "🗺️" },
  { href: "/quests", label: "MY TASKS", icon: "✅" },
  { href: "/character", label: "PROFILE & SKILLS", icon: "🍄" },
  { href: "/inventory", label: "BACKPACK", icon: "🎒" },
  { href: "/shop", label: "ITEM SHOP", icon: "🏪" },
  { href: "/achievements", label: "ACHIEVEMENTS", icon: "⭐" },
  { href: "/history", label: "HISTORY", icon: "📜" },
  { href: "/settings", label: "SETTINGS", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { character } = useGame();
  const router = useRouter();

  const handleNavClick = () => {
    soundEngine.playJump();
  };

  const handleLogout = async () => {
    soundEngine.playJump();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#101018] border-r-4 border-black text-white select-none shrink-0 h-screen sticky top-0 shadow-[4px_0_0_0_#202030]">
      {/* 2D Mario Logo Banner */}
      <div className="p-5 border-b-4 border-black bg-[#E52521] text-center shadow-[inset_0_-4px_0_#A01010]">
        <div className="inline-block bg-[#FBD000] border-2 border-black px-2 py-0.5 mb-1 shadow-[2px_2px_0_#000]">
          <span className="font-pixel text-[9px] text-black font-black">SUPER</span>
        </div>
        <h1 className="font-pixel text-base font-black text-white tracking-widest drop-shadow-[2px_2px_0_#000]">
          LIFE RPG
        </h1>
        <div className="text-[8px] font-pixel text-[#FBD000] mt-1 tracking-wider">
          ★ LEVEL UP YOUR LIFE ★
        </div>
      </div>

      {/* Hero Badge Styled Like Question Block */}
      {character && (
        <div className="m-3 p-3 question-block text-black">
          <div className="flex items-center gap-2.5 font-pixel">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm border-2 border-white">
              👑
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] font-black truncate">{character.name}</div>
              <div className="text-[9px] font-bold text-[#884400]">
                LEVEL {character.level}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retro Pixel Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 font-pixel text-[10px] transition-all border-2 border-black ${
                isActive
                  ? "bg-[#5C94FC] text-black shadow-[3px_3px_0_#000] translate-x-1"
                  : "bg-[#202030] text-white hover:bg-[#303048] shadow-[2px_2px_0_#000]"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Log Out */}
      <div className="p-3 border-t-4 border-black bg-[#181820]">
        <button
          onClick={handleLogout}
          className="pixel-btn pixel-btn-red w-full text-[9px] py-2"
        >
          <span>🚪 LOG OUT</span>
        </button>
      </div>
    </aside>
  );
}
