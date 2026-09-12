"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { soundEngine } from "@/lib/sound";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCoin();
    setSubmitted(true);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md pixel-box p-8 bg-[#181824] border-2 border-yellow-400 shadow-[6px_6px_0px_#eab308]">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex w-14 h-14 question-block items-center justify-center font-pixel text-2xl text-yellow-950 mb-1">
            ?
          </div>
          <div className="font-pixel text-[10px] text-yellow-400 tracking-wider">
            ★ RECOVERY CIPHER ★
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-white tracking-wide">
            RECOVER SECRET KEY
          </h2>
          <p className="font-retro text-xs text-slate-400">
            Dispatch a reset scroll to your registered adventurer address
          </p>
        </div>

        {submitted ? (
          <div className="p-5 pixel-box-green text-white text-center space-y-3">
            <span className="text-3xl inline-block">🍄</span>
            <h4 className="font-pixel text-xs text-yellow-300">DISPATCH TRANSMITTED!</h4>
            <p className="font-retro text-xs text-emerald-100">
              If an adventurer exists for <span className="font-bold text-white">{email}</span>, a
              recovery cipher has been dispatched.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => soundEngine.playJump()}
                className="pixel-btn pixel-btn-yellow font-pixel text-[9px] px-3 py-2 text-slate-950 inline-block"
              >
                RETURN TO ARCADE LOGIN
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-pixel text-[9px] text-yellow-400 uppercase tracking-wider mb-2">
                PLAYER EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adventurer@liferpg.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 font-retro text-xs focus:border-yellow-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="pixel-btn pixel-btn-yellow w-full py-3 text-slate-950 font-pixel text-xs tracking-wider flex items-center justify-center gap-2"
            >
              DISPATCH RECOVERY CIPHER
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/login"
            onClick={() => soundEngine.playPause()}
            className="inline-flex items-center gap-1.5 font-retro text-xs text-yellow-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
