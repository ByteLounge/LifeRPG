"use client";

import React, { useState } from "react";
import { LogOut, Check } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useRouter } from "next/navigation";
import { soundEngine } from "@/lib/sound";

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
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme || "dark");
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCoin();
    setSaved(true);

    try {
      setTheme(selectedTheme);
      setToast({ text: "Settings saved successfully!", type: "success" });
    } catch {
      soundEngine.playPowerDown();
      setToast({ text: "Failed to update settings.", type: "error" });
    } finally {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = async () => {
    soundEngine.playPipe();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="pixel-box-mario p-4 md:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[9px] bg-yellow-400 text-slate-950 px-2 py-0.5 border border-black font-bold">
              PREFERENCES
            </span>
          </div>
          <h1 className="font-pixel text-base sm:text-xl text-yellow-300 tracking-wider">
            SETTINGS & SOUND
          </h1>
          <p className="font-retro text-xs text-red-100 mt-1">
            Configure sound effects, screen theme, and your local timezone.
          </p>
        </div>

        <div className="font-pixel text-xs bg-red-950 px-3 py-2 border-2 border-yellow-400 text-yellow-300 w-fit">
          ⚙️ SETTINGS
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sound Test Card */}
        <div className="pixel-box p-6 bg-[#181824] border-2 border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-pixel text-xs text-yellow-400 flex items-center gap-2">
                <span>🔊</span>
                <span>8-BIT RETRO SOUND EFFECTS</span>
              </h3>
              <p className="font-retro text-xs text-slate-300 mt-1">
                Authentic retro chiptune sound effects play when you complete tasks and level up.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) soundEngine.playCoin();
              }}
              className={`pixel-btn font-pixel text-[9px] px-3.5 py-2 shrink-0 ${
                soundEnabled ? "pixel-btn-green text-white" : "pixel-btn-red text-white"
              }`}
            >
              {soundEnabled ? "SOUND: ON" : "SOUND: MUTED"}
            </button>
          </div>

          {/* Sound Test Board */}
          <div className="p-4 bg-slate-900 border-2 border-slate-800 space-y-2">
            <div className="font-pixel text-[9px] text-yellow-500 uppercase">SOUND TEST PREVIEW:</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => soundEngine.playCoin()}
                className="font-pixel text-[8px] px-2.5 py-1.5 bg-yellow-400 text-slate-950 border border-black hover:bg-yellow-300 active:translate-y-0.5"
              >
                🪙 COIN
              </button>
              <button
                type="button"
                onClick={() => soundEngine.playJump()}
                className="font-pixel text-[8px] px-2.5 py-1.5 bg-sky-500 text-white border border-black hover:bg-sky-400 active:translate-y-0.5"
              >
                ⬆️ JUMP
              </button>
              <button
                type="button"
                onClick={() => soundEngine.playPowerUp()}
                className="font-pixel text-[8px] px-2.5 py-1.5 bg-purple-500 text-white border border-black hover:bg-purple-400 active:translate-y-0.5"
              >
                ⭐ POWER-UP
              </button>
              <button
                type="button"
                onClick={() => soundEngine.playLevelUp()}
                className="font-pixel text-[8px] px-2.5 py-1.5 bg-red-500 text-white border border-black hover:bg-red-400 active:translate-y-0.5"
              >
                🍄 1-UP JINGLE
              </button>
              <button
                type="button"
                onClick={() => soundEngine.playQuestComplete()}
                className="font-pixel text-[8px] px-2.5 py-1.5 bg-emerald-500 text-white border border-black hover:bg-emerald-400 active:translate-y-0.5"
              >
                🚩 TASK COMPLETE
              </button>
              <button
                type="button"
                onClick={() => soundEngine.playPipe()}
                className="font-pixel text-[8px] px-2.5 py-1.5 bg-emerald-700 text-white border border-black hover:bg-emerald-600 active:translate-y-0.5"
              >
                🕳️ WARP PIPE
              </button>
            </div>
          </div>
        </div>

        {/* Visual Theme Card */}
        <div className="pixel-box p-6 bg-[#181824] border-2 border-slate-700 space-y-4">
          <div>
            <h3 className="font-pixel text-xs text-yellow-400 flex items-center gap-2">
              <span>🎨</span>
              <span>SCREEN THEME</span>
            </h3>
            <p className="font-retro text-xs text-slate-300 mt-1">Choose your preferred visual style.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "dark", label: "DARK THEME", desc: "Dark background with vibrant retro neon colors" },
              { id: "light", label: "LIGHT THEME", desc: "Bright overworld background for daytime use" },
            ].map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    soundEngine.playPause();
                    setSelectedTheme(t.id);
                  }}
                  className={`p-3.5 border-2 cursor-pointer select-none transition-all ${
                    isSelected
                      ? "bg-slate-900 border-yellow-400 shadow-[3px_3px_0px_#eab308]"
                      : "bg-slate-950 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className={`font-pixel text-[10px] ${isSelected ? "text-yellow-400" : "text-slate-300"}`}>
                    {t.label}
                  </div>
                  <p className="font-retro text-xs text-slate-400 mt-1">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timezone */}
        <div className="pixel-box p-6 bg-[#181824] border-2 border-slate-700 space-y-4">
          <div>
            <h3 className="font-pixel text-xs text-yellow-400 flex items-center gap-2">
              <span>🌍</span>
              <span>LOCAL TIMEZONE</span>
            </h3>
            <p className="font-retro text-xs text-slate-300 mt-1">
              Determines midnight for daily task resets and keeping your daily streak active.
            </p>
          </div>

          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border-2 border-slate-700 text-yellow-300 font-retro text-xs focus:border-yellow-400 outline-none"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="pixel-btn pixel-btn-red font-pixel text-[9px] px-4 py-3 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span>LOG OUT</span>
          </button>

          <button
            type="submit"
            className="pixel-btn pixel-btn-yellow font-pixel text-[10px] px-6 py-3 text-slate-950 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            {saved ? <Check className="w-4 h-4" /> : <span>💾</span>}
            <span>{saved ? "SETTINGS SAVED!" : "SAVE SETTINGS"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
