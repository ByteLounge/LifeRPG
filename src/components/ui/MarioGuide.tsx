"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { soundEngine } from "@/lib/sound";
import { X, ChevronRight, ChevronLeft, HelpCircle, Volume2 } from "lucide-react";

// Plain English guidance tips for each page in the app
const PAGE_TIPS: Record<string, string[]> = {
  "/": [
    "Welcome! Life RPG turns your real-life tasks, study time, and workouts into a game.",
    "Click the yellow [?] block on screen to collect coins and test out the sounds!",
    "Click 'Start Playing' or '1-Click Demo' to get your character started in seconds.",
  ],
  "/dashboard": [
    "Welcome to your Dashboard! This is your daily home base.",
    "Look at your daily tasks below. When you finish one in real life, tap its checkmark to claim XP and coins!",
    "Tip: Finish 3 tasks today to earn the +50 XP daily bonus challenge!",
    "Your Level Progress bar at the top shows how close you are to reaching the next level.",
  ],
  "/quests": [
    "This is your Tasks page! Here you can see all your habits, to-dos, and goals.",
    "Click '+ New Task' to add something you want to do today, like 'Study for 1 hour' or 'Go to gym'.",
    "Use the filter buttons at the top to switch between Active, Completed, or Daily Habits.",
  ],
  "/character": [
    "This is your Profile & Skills page!",
    "You have 6 life skills: Intellect, Strength, Discipline, Creativity, Vitality, and Social.",
    "When you complete tasks, the matching skill levels up! For example: gym gives Strength XP, reading gives Intellect XP.",
    "Click the 'Jump!' button or click your character portrait to hear a power-up chime!",
  ],
  "/shop": [
    "Welcome to the Item Shop!",
    "You can spend the gold coins you earn from finishing tasks on cool avatar frames, titles, and themes.",
    "Everything here is bought with in-game coins you earn through real-world effort. No real money needed!",
  ],
  "/inventory": [
    "This is your Backpack!",
    "Any items or titles you buy in the shop are stored here.",
    "Click 'Equip' on any item to show it off on your profile!",
  ],
  "/achievements": [
    "Welcome to Achievements & Badges!",
    "These are special goals you unlock as you stay consistent (like a 3-day streak or finishing 10 tasks).",
    "Each achievement awards extra XP and bonus coins!",
  ],
  "/history": [
    "This is your Activity History.",
    "Every time you finish a task, level up, or buy an item, it gets recorded here with a timestamp.",
    "Use this page to look back and see how much you've accomplished over time!",
  ],
  "/settings": [
    "This is your Settings page.",
    "You can turn sound effects on or off, or press the preview buttons to test each retro sound.",
    "Make sure your timezone is set correctly so your daily tasks reset at your local midnight.",
  ],
  "/login": [
    "Welcome back! Log in with your email and password to continue your streak.",
    "Just want to try it out first? Click '1-Click Demo Hero' to test the full app instantly without typing!",
  ],
  "/signup": [
    "Ready to level up your life? Enter your name, choose a nickname, and create your free account!",
  ],
  "/onboarding": [
    "Welcome new player! Pick which skill you want to focus on first to get +25 bonus starter XP.",
    "Then choose your favorite screen style and click 'Get Started'!",
  ],
};

const DEFAULT_TIPS = [
  "I'm Mario, your guide! Tap on me anytime to hear helpful tips for this page.",
  "Check off your daily tasks to earn XP and level up your character!",
];

export function MarioGuide() {
  const pathname = usePathname();
  const [isJumping, setIsJumping] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isBubbleOpen, setIsBubbleOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");

  // Get current tips based on the active route
  const currentTips = PAGE_TIPS[pathname] || DEFAULT_TIPS;

  // Reset tip index when route changes
  useEffect(() => {
    setTipIndex(0);
    setIsBubbleOpen(true);
  }, [pathname]);

  const handleMarioClick = () => {
    soundEngine.playJump();
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);

    // If bubble is closed or minimized, open it; otherwise advance tip
    if (!isBubbleOpen || isMinimized) {
      setIsBubbleOpen(true);
      setIsMinimized(false);
    } else {
      setTipIndex((prev) => (prev + 1) % currentTips.length);
    }
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPause();
    setTipIndex((prev) => (prev + 1) % currentTips.length);
  };

  const handlePrevTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPause();
    setTipIndex((prev) => (prev - 1 + currentTips.length) % currentTips.length);
  };

  const toggleSide = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPause();
    setSide((prev) => (prev === "right" ? "left" : "right"));
  };

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        side === "right" ? "right-3 md:right-8" : "left-3 md:left-72"
      } bottom-20 md:bottom-8 select-none`}
    >
      {/* Speech Bubble */}
      {isBubbleOpen && !isMinimized && (
        <div className="mb-3 max-w-[280px] sm:max-w-xs pixel-bubble p-3.5 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[9px] text-red-600 font-bold">🍄 MARIO GUIDE</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSide}
                title="Move Mario to other side"
                className="text-[10px] px-1 bg-slate-200 border border-black hover:bg-yellow-200"
              >
                ↔
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playPause();
                  setIsBubbleOpen(false);
                }}
                className="text-black hover:text-red-600 font-bold text-xs px-1"
                title="Close speech bubble"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Simple plain English tip */}
          <p className="font-retro text-[11px] leading-relaxed text-slate-900 min-h-[44px]">
            {currentTips[tipIndex % currentTips.length]}
          </p>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-300 font-retro text-[10px]">
            <span className="text-slate-500">
              Tip {tipIndex + 1} of {currentTips.length}
            </span>
            <div className="flex items-center gap-1.5">
              {currentTips.length > 1 && (
                <>
                  <button
                    onClick={handlePrevTip}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-yellow-300 border border-black"
                    title="Previous tip"
                  >
                    ◀
                  </button>
                  <button
                    onClick={handleNextTip}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-yellow-300 border border-black font-bold"
                    title="Next tip"
                  >
                    ▶ Next
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2D Mario Sprite Character */}
      <div className="flex items-end justify-end gap-2">
        {/* Minimized / Help button */}
        {!isBubbleOpen && (
          <button
            onClick={() => {
              soundEngine.playCoin();
              setIsBubbleOpen(true);
            }}
            className="pixel-btn pixel-btn-yellow font-pixel text-[8px] px-2 py-1 shadow-md mb-2 flex items-center gap-1"
          >
            <span>💬</span>
            <span>NEED HELP?</span>
          </button>
        )}

        {/* Mario Figure */}
        <div
          onClick={handleMarioClick}
          className={`cursor-pointer transition-transform duration-100 flex flex-col items-center group ${
            isJumping ? "animate-mario-jump" : "animate-mario-bob"
          }`}
          title="Click Mario to jump & get tips!"
        >
          {/* Animated 2D Pixel Mario Canvas / SVG */}
          <div className="relative p-1 bg-yellow-400/20 border-2 border-dashed border-yellow-400/40 rounded-lg group-hover:border-yellow-400">
            <svg
              width="44"
              height="48"
              viewBox="0 0 16 16"
              className="drop-shadow-[2px_2px_0px_#000000]"
              style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
            >
              {/* Row 1: Cap */}
              <rect x="5" y="1" width="5" height="1" fill="#E52521" />
              {/* Row 2: Cap */}
              <rect x="4" y="2" width="9" height="1" fill="#E52521" />
              {/* Row 3: Hair / Face */}
              <rect x="4" y="3" width="3" height="1" fill="#6B3811" />
              <rect x="7" y="3" width="2" height="1" fill="#F8B878" />
              <rect x="9" y="3" width="1" height="1" fill="#000000" />
              <rect x="10" y="3" width="1" height="1" fill="#F8B878" />
              {/* Row 4: Face / Ear / Eye */}
              <rect x="3" y="4" width="1" height="1" fill="#6B3811" />
              <rect x="4" y="4" width="1" height="1" fill="#F8B878" />
              <rect x="5" y="4" width="1" height="1" fill="#6B3811" />
              <rect x="6" y="4" width="3" height="1" fill="#F8B878" />
              <rect x="9" y="4" width="1" height="1" fill="#000000" />
              <rect x="10" y="4" width="3" height="1" fill="#F8B878" />
              {/* Row 5: Face / Mustache */}
              <rect x="3" y="5" width="1" height="1" fill="#6B3811" />
              <rect x="4" y="5" width="1" height="1" fill="#F8B878" />
              <rect x="5" y="5" width="2" height="1" fill="#6B3811" />
              <rect x="7" y="5" width="3" height="1" fill="#F8B878" />
              <rect x="10" y="5" width="4" height="1" fill="#000000" />
              {/* Row 6: Mustache / Chin */}
              <rect x="4" y="6" width="2" height="1" fill="#6B3811" />
              <rect x="6" y="6" width="5" height="1" fill="#F8B878" />
              {/* Row 7: Shirt */}
              <rect x="5" y="7" width="6" height="1" fill="#E52521" />
              {/* Row 8: Overalls / Shirt */}
              <rect x="4" y="8" width="2" height="1" fill="#E52521" />
              <rect x="6" y="8" width="1" height="1" fill="#0024B8" />
              <rect x="7" y="8" width="2" height="1" fill="#E52521" />
              <rect x="9" y="8" width="1" height="1" fill="#0024B8" />
              <rect x="10" y="8" width="2" height="1" fill="#E52521" />
              {/* Row 9: Overalls & Buttons */}
              <rect x="3" y="9" width="3" height="1" fill="#E52521" />
              <rect x="6" y="9" width="1" height="1" fill="#FBD000" />
              <rect x="7" y="9" width="2" height="1" fill="#0024B8" />
              <rect x="9" y="9" width="1" height="1" fill="#FBD000" />
              <rect x="10" y="9" width="3" height="1" fill="#E52521" />
              {/* Row 10: Gloves & Overalls */}
              <rect x="2" y="10" width="3" height="1" fill="#FFFFFF" />
              <rect x="5" y="10" width="6" height="1" fill="#0024B8" />
              <rect x="11" y="10" width="3" height="1" fill="#FFFFFF" />
              {/* Row 11: Gloves & Overalls */}
              <rect x="2" y="11" width="3" height="1" fill="#FFFFFF" />
              <rect x="5" y="11" width="6" height="1" fill="#0024B8" />
              <rect x="11" y="11" width="3" height="1" fill="#FFFFFF" />
              {/* Row 12: Pants */}
              <rect x="4" y="12" width="8" height="1" fill="#0024B8" />
              {/* Row 13: Legs */}
              <rect x="4" y="13" width="3" height="1" fill="#0024B8" />
              <rect x="9" y="13" width="3" height="1" fill="#0024B8" />
              {/* Row 14: Shoes */}
              <rect x="3" y="14" width="3" height="1" fill="#6B3811" />
              <rect x="10" y="14" width="3" height="1" fill="#6B3811" />
              {/* Row 15: Shoes Bottom */}
              <rect x="2" y="15" width="4" height="1" fill="#6B3811" />
              <rect x="10" y="15" width="4" height="1" fill="#6B3811" />
            </svg>
          </div>

          <span className="font-pixel text-[8px] text-yellow-400 bg-black/80 px-1.5 py-0.5 rounded mt-1 border border-yellow-400/50">
            MARIO
          </span>
        </div>
      </div>
    </div>
  );
}
