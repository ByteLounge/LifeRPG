"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { soundEngine } from "@/lib/sound";

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "HOME", icon: "🏠" },
  { href: "/quests", label: "TASKS", icon: "✅" },
  { href: "/character", label: "PROFILE", icon: "🍄" },
  { href: "/inventory", label: "BAG", icon: "🎒" },
  { href: "/shop", label: "SHOP", icon: "🏪" },
];

export function MobileNav() {
  const pathname = usePathname();

  const handleClick = () => {
    soundEngine.playJump();
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101018] border-t-4 border-black px-1 py-1.5 flex justify-around items-center select-none shadow-[0_-4px_0_0_#202030]">
      {MOBILE_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleClick}
            className={`flex flex-col items-center justify-center w-16 py-1 border-2 border-black font-pixel transition-all ${
              isActive
                ? "bg-[#FBD000] text-black shadow-[2px_2px_0_#000] -translate-y-1"
                : "bg-[#202030] text-white hover:bg-[#303040]"
            }`}
          >
            <span className="text-base leading-none mb-1">{item.icon}</span>
            <span className="text-[8px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
