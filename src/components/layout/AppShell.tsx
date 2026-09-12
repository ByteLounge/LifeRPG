"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { LevelUpModal } from "@/components/progression/LevelUpModal";
import { ToastNotification } from "@/components/ui/ToastNotification";
import { useGame } from "@/components/providers/GameProvider";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useGame();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicPage) {
        router.push("/login");
      } else if (isAuthenticated && profile && !profile.onboarded && pathname !== "/onboarding") {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, profile, pathname, router]);

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
        {children}
        <ToastNotification />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d15] text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 question-block flex items-center justify-center font-pixel text-2xl text-yellow-950 animate-bounce">
          ?
        </div>
        <p className="font-pixel text-xs text-yellow-400 tracking-wider">LOADING WORLD 1-1...</p>
        <p className="font-retro text-xs text-slate-500">Preparing retro chiptune audio & quest ledger</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
      <MobileNav />
      <LevelUpModal />
      <ToastNotification />
    </div>
  );
}
