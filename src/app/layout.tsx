import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/components/providers/GameProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Life RPG — Gamified Real-World Productivity",
  description:
    "Transform daily habits, study routines, and fitness goals into an epic RPG progression experience. Gain XP, level up, unlock cosmetics, and master your life.",
  keywords: ["Productivity", "RPG", "Habit Tracker", "Gamification", "Task Management"],
  authors: [{ name: "Life RPG Team" }],
  openGraph: {
    title: "Life RPG — Turn Life Into An RPG",
    description: "Conquer real life tasks, build unbreakable streaks, and level up your character.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen antialiased selection:bg-amber-500 selection:text-slate-950 font-sans">
        <GameProvider>
          <AppShell>{children}</AppShell>
        </GameProvider>
      </body>
    </html>
  );
}
