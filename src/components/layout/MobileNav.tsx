"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Shield, User, Backpack, Store } from "lucide-react";

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Hub", icon: Compass },
  { href: "/quests", label: "Quests", icon: Shield },
  { href: "/character", label: "Hero", icon: User },
  { href: "/inventory", label: "Bag", icon: Backpack },
  { href: "/shop", label: "Shop", icon: Store },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c121e]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex justify-around items-center select-none shadow-2xl">
      {MOBILE_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl text-xs transition-colors ${
              isActive ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
