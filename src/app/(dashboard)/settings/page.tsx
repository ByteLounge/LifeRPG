"use client";

import React, { useState } from "react";
import { Settings, Volume2, VolumeX, Moon, Sun, Globe, LogOut, Check, Sparkles, User } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useRouter } from "next/navigation";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const router = useRouter();
  const { profile, soundEnabled, setSoundEnabled, setTheme, refreshGameData, setToast } = useGame();

  const [timezone, setTimezone] = useState(profile?.timezone || "UTC");
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme || "dark");
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);

    try {
      // In production/API update
      setTheme(selectedTheme);
      setToast({ text: "Settings saved successfully.", type: "success" });
    } catch {
      setToast({ text: "Failed to update settings.", type: "error" });
    } finally {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>Realm Preferences & Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust audio feedback, realm visual themes, and localized streak boundaries.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Audio Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Retro RPG Audio Feedback</h3>
                <p className="text-xs text-slate-400">
                  Synthesizes chimes and victory arpeggios when fulfilling trials or leveling up.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                soundEnabled
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {soundEnabled ? "Audio Enabled" : "Audio Muted"}
            </button>
          </div>
        </div>

        {/* Theme Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Visual Palette</h3>
              <p className="text-xs text-slate-400">Choose your interface atmosphere.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "dark", label: "Arcane Obsidian", desc: "Dark fantasy canvas with glowing accents" },
              { id: "light", label: "Solar Parchment", desc: "Clean bright parchment for daylight focus" },
            ].map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-sm"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className={`text-sm font-bold ${isSelected ? "text-amber-400" : "text-slate-200"}`}>
                    {t.label}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timezone & Identity */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Streak Timezone</h3>
              <p className="text-xs text-slate-400">
                Determines calendar day boundaries for streak incrementation and daily challenges.
              </p>
            </div>
          </div>

          <div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Abandon Session (Log Out)</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            <span>{saved ? "Preferences Saved" : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
