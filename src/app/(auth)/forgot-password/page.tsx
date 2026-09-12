"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center text-slate-950 font-black mb-3 shadow-rpg-gold">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-2xl font-black font-serif text-white tracking-wide">Recover Password</h2>
          <p className="text-sm text-slate-400 mt-1">We will send a reset cipher to your registered email</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-300">Recovery Instructions Sent</h4>
            <p className="text-xs text-slate-400">
              If an account is associated with <span className="text-slate-200 font-semibold">{email}</span>, a recovery link has been dispatched.
            </p>
            <div className="pt-2">
              <Link href="/login" className="text-xs font-bold text-amber-400 hover:underline">
                Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adventurer@liferpg.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Dispatch Recovery Cipher
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
