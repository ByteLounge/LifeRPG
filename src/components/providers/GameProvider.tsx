"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { soundEngine } from "@/lib/sound";
import confetti from "canvas-confetti";
import { XPProgressInfo, getXPProgress } from "@/lib/game-engine/progression";

export interface CharacterState {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  gold: number;
  equippedTitleId?: string | null;
  equippedFrameId?: string | null;
  equippedThemeId?: string | null;
}

export interface AttributeState {
  id: string;
  type: "STRENGTH" | "INTELLECT" | "DISCIPLINE" | "CREATIVITY" | "VITALITY" | "SOCIAL";
  currentXp: number;
  level: number;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface ProfileState {
  displayName: string;
  avatar: string;
  timezone: string;
  soundEnabled: boolean;
  theme: string;
  onboarded: boolean;
}

export interface LevelUpCelebration {
  oldLevel: number;
  newLevel: number;
  xpEarned: number;
  goldEarned: number;
  unlockedAchievements: Array<{ name: string; icon: string; rewardXp: number; rewardGold: number }>;
}

interface GameContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string } | null;
  profile: ProfileState | null;
  character: CharacterState | null;
  attributes: AttributeState[];
  streak: StreakState | null;
  xpProgress: XPProgressInfo | null;
  soundEnabled: boolean;
  levelUpModalData: LevelUpCelebration | null;
  closeLevelUpModal: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTheme: (theme: string) => void;
  refreshGameData: () => Promise<void>;
  completeQuestOptimistic: (questId: string) => Promise<{ success: boolean; error?: string }>;
  spendGoldOptimistic: (amount: number) => void;
  toastMessage: { text: string; type: "success" | "error" | "info" } | null;
  setToast: (msg: { text: string; type: "success" | "error" | "info" } | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [character, setCharacter] = useState<CharacterState | null>(null);
  const [attributes, setAttributes] = useState<AttributeState[]>([]);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(false);
  const [levelUpModalData, setLevelUpModalData] = useState<LevelUpCelebration | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((msg: { text: string; type: "success" | "error" | "info" } | null) => {
    setToastMessage(msg);
    if (msg) {
      setTimeout(() => setToastMessage(null), 4000);
    }
  }, []);

  const refreshGameData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setIsAuthenticated(true);
          setUser(json.data.user);
          setProfile(json.data.profile);
          setCharacter(json.data.character);
          setAttributes(json.data.attributes || []);
          setStreak(json.data.streak || null);
          return;
        }
      }
      setIsAuthenticated(false);
      setUser(null);
      setCharacter(null);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGameData();
    const storedSound = localStorage.getItem("life_rpg_sound_enabled");
    setSoundEnabledState(storedSound === "true");
  }, [refreshGameData]);

  const handleSetSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundEngine.setEnabled(enabled);
    localStorage.setItem("life_rpg_sound_enabled", String(enabled));
  };

  const handleSetTheme = (themeName: string) => {
    if (profile) {
      setProfile({ ...profile, theme: themeName });
    }
    document.documentElement.classList.remove("light", "dark", "theme-arcane", "theme-emerald");
    if (themeName === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.add("dark");
      if (themeName && themeName !== "dark") {
        document.documentElement.classList.add(themeName);
      }
    }
  };

  const spendGoldOptimistic = (amount: number) => {
    if (!character) return;
    setCharacter({ ...character, gold: Math.max(0, character.gold - amount) });
    soundEngine.playCoin();
  };

  const completeQuestOptimistic = async (questId: string): Promise<{ success: boolean; error?: string }> => {
    if (!character) return { success: false, error: "Character not loaded" };

    const previousCharacter = { ...character };
    const previousStreak = streak ? { ...streak } : null;

    try {
      soundEngine.playQuestComplete();

      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: `client_${Date.now()}_${questId}` }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        // Rollback state on error
        setCharacter(previousCharacter);
        setStreak(previousStreak);
        const errMsg = json.error?.message || "Quest completion failed.";
        showToast({ text: errMsg, type: "error" });
        return { success: false, error: errMsg };
      }

      const data = json.data;
      setCharacter(data.newCharacter);
      setStreak(data.newStreak);
      setAttributes(data.newAttributes);

      if (data.leveledUp) {
        soundEngine.playLevelUp();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#F59E0B", "#38BDF8", "#10B981", "#EC4899"],
          });
        } catch {
          // ignore
        }

        setLevelUpModalData({
          oldLevel: data.oldLevel,
          newLevel: data.newLevel,
          xpEarned: data.xpEarned,
          goldEarned: data.goldEarned,
          unlockedAchievements: data.unlockedAchievements || [],
        });
      } else {
        showToast({
          text: `Quest Complete! +${data.xpEarned} XP, +${data.goldEarned} Gold`,
          type: "success",
        });
      }

      if (data.unlockedAchievements && data.unlockedAchievements.length > 0 && !data.leveledUp) {
        soundEngine.playAchievement();
        data.unlockedAchievements.forEach((ach: { name: string }) => {
          showToast({
            text: `🏆 Achievement Unlocked: ${ach.name}!`,
            type: "info",
          });
        });
      }

      return { success: true };
    } catch {
      // Rollback on network failure
      setCharacter(previousCharacter);
      setStreak(previousStreak);
      const netErr = "Network error: Quest couldn't be completed. Please check your connection.";
      showToast({ text: netErr, type: "error" });
      return { success: false, error: netErr };
    }
  };

  const xpProgress = character ? getXPProgress(character.totalXp) : null;

  return (
    <GameContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        profile,
        character,
        attributes,
        streak,
        xpProgress,
        soundEnabled,
        levelUpModalData,
        closeLevelUpModal: () => setLevelUpModalData(null),
        setSoundEnabled: handleSetSoundEnabled,
        setTheme: handleSetTheme,
        refreshGameData,
        completeQuestOptimistic,
        spendGoldOptimistic,
        toastMessage,
        setToast: showToast,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
