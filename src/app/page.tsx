"use client";

import React, { useState } from "react";
import Link from "next/link";
import { soundEngine } from "@/lib/sound";

export default function LandingPage() {
  const [demoHit, setDemoHit] = useState(false);
  const [demoCoins, setDemoCoins] = useState(35);
  const [demoXp, setDemoXp] = useState(50);

  const handleHitBlock = () => {
    soundEngine.playCoin();
    setDemoCoins((prev) => prev + 1);
    setDemoXp((prev) => prev + 25);
    setDemoHit(true);
    setTimeout(() => setDemoHit(false), 200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#181824] text-white select-none">
      {/* 2D Mario Arcade Header */}
      <header className="px-4 md:px-8 py-4 bg-[#000000] border-b-4 border-black flex items-center justify-between shadow-[0_4px_0_0_#202030] font-pixel">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E52521] border-2 border-white flex items-center justify-center text-sm">
            🍄
          </div>
          <div>
            <span className="text-[#FBD000] text-sm md:text-base font-black tracking-wider">SUPER LIFE RPG</span>
            <div className="text-[8px] text-[#A0A0B0]">WORLD 1-1 PRODUCTIVITY</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="pixel-btn pixel-btn-dark text-[9px] md:text-[10px] py-2 px-3"
          >
            CONTINUE
          </Link>
          <Link
            href="/signup"
            className="pixel-btn pixel-btn-gold text-[9px] md:text-[10px] py-2 px-3"
          >
            START 1P
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-block bg-[#E52521] border-4 border-black px-4 py-1.5 font-pixel text-[10px] md:text-xs text-white shadow-[4px_4px_0_#000]">
          ★ 8-BIT GAMIFIED PRODUCTIVITY ★
        </div>

        <h1 className="font-pixel text-2xl md:text-4xl lg:text-5xl leading-tight text-[#FBD000] drop-shadow-[4px_4px_0_#000]">
          TRANSFORM HABITS <br />
          <span className="text-[#5C94FC]">INTO AN 8-BIT RPG!</span>
        </h1>

        <p className="font-retro text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Clear real-world study routines, physical conditioning, and tasks to collect Gold Coins, level up your hero, and unlock legendary retro cosmetics!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-2">
          <Link
            href="/signup"
            onClick={() => soundEngine.playJump()}
            className="pixel-btn pixel-btn-green w-full sm:w-auto text-xs md:text-sm py-3 px-6"
          >
            🎮 PRESS START (SIGN UP)
          </Link>
          <Link
            href="/login"
            onClick={() => soundEngine.playJump()}
            className="pixel-btn pixel-btn-blue w-full sm:w-auto text-xs md:text-sm py-3 px-6"
          >
            ⚡ INSTANT DEMO RUN
          </Link>
        </div>

        {/* Interactive Mario Question Block Card */}
        <div className="w-full max-w-md p-6 pixel-box text-left mt-8 font-pixel">
          <div className="flex items-center justify-between text-[10px] mb-4 pb-2 border-b-2 border-black">
            <span className="text-[#FBD000]">HIT THE [?] BLOCK:</span>
            <div className="flex items-center gap-3">
              <span className="text-[#5C94FC]">{demoXp} XP</span>
              <span className="text-[#FBD000]">🪙 x{demoCoins}</span>
            </div>
          </div>

          <div
            onClick={handleHitBlock}
            className={`p-4 question-block cursor-pointer transition-transform ${
              demoHit ? "-translate-y-2 brightness-125" : "hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center gap-3 text-black">
              <div className="w-10 h-10 bg-black text-[#FBD000] border-2 border-white flex items-center justify-center text-lg font-black shrink-0">
                ?
              </div>
              <div>
                <div className="text-[10px] font-black">
                  STUDY FOR 45 MINUTES
                </div>
                <div className="text-[8px] text-[#502000] font-bold mt-1">
                  REWARDS: +25 EXP • +1 COIN • +15 INTELLECT
                </div>
              </div>
            </div>
          </div>

          <p className="text-[8px] text-center text-[#A0A0B0] mt-3">
            ▲ TAP THE BLOCK ABOVE TO TEST RETRO COIN SFX ▲
          </p>
        </div>
      </section>

      {/* Feature Blocks (Styled like Brick / Pipe / Star Blocks) */}
      <section className="py-12 px-4 bg-[#101018] border-t-4 border-black font-pixel">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 pixel-box-mario">
            <div className="text-2xl mb-3">🍄</div>
            <h3 className="text-xs font-bold text-[#E52521] mb-2">SERVER-AUTHORITATIVE</h3>
            <p className="font-retro text-xs text-slate-300 leading-relaxed">
              No client cheating! All EXP curves, levels, and coin transactions are verified on the backend.
            </p>
          </div>

          <div className="p-5 pixel-box-green">
            <div className="text-2xl mb-3">🔥</div>
            <h3 className="text-xs font-bold text-[#00E800] mb-2">FIREBALL STREAKS</h3>
            <p className="font-retro text-xs text-slate-300 leading-relaxed">
              Timezone-aware daily streak engine keeps your momentum burning every day.
            </p>
          </div>

          <div className="p-5 pixel-box-gold">
            <div className="text-2xl mb-3">⭐</div>
            <h3 className="text-xs font-bold text-[#FBD000] mb-2">TOAD&apos;S BAZAAR</h3>
            <p className="font-retro text-xs text-slate-300 leading-relaxed">
              Spend your earned gold coins on rare avatar frames, titles, and custom realm themes.
            </p>
          </div>
        </div>
      </section>

      {/* Retro Arcade Footer */}
      <footer className="py-4 px-4 bg-black border-t-4 border-black text-center font-pixel text-[8px] text-[#808090]">
        © 2026 SUPER LIFE RPG • 2D RETRO PRODUCTIVITY SYSTEM
      </footer>
    </div>
  );
}
