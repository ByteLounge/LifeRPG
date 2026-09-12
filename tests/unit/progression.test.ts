import { describe, it, expect } from "vitest";
import {
  getXPRequiredForLevel,
  getLevelFromXP,
  getXPProgress,
  getXPToNextLevel,
  evaluateStreak,
  DIFFICULTY_REWARDS,
} from "@/lib/game-engine/progression";
import { evaluateNewAchievements } from "@/lib/game-engine/achievements";

describe("Progression Engine - Non-linear XP Curve", () => {
  it("computes baseline level XP requirements correctly", () => {
    expect(getXPRequiredForLevel(1)).toBe(0);
    expect(getXPRequiredForLevel(2)).toBe(100);
    // (3-1)^1.5 = 2^1.5 ≈ 2.8284 * 100 ≈ 283
    expect(getXPRequiredForLevel(3)).toBe(283);
    // (4-1)^1.5 = 3^1.5 ≈ 5.196 * 100 ≈ 520
    expect(getXPRequiredForLevel(4)).toBe(520);
    // (5-1)^1.5 = 4^1.5 = 8 * 100 = 800
    expect(getXPRequiredForLevel(5)).toBe(800);
  });

  it("calculates level from cumulative XP", () => {
    expect(getLevelFromXP(0)).toBe(1);
    expect(getLevelFromXP(50)).toBe(1);
    expect(getLevelFromXP(100)).toBe(2);
    expect(getLevelFromXP(200)).toBe(2);
    expect(getLevelFromXP(283)).toBe(3);
    expect(getLevelFromXP(799)).toBe(4);
    expect(getLevelFromXP(800)).toBe(5);
  });

  it("calculates progress percentages accurately", () => {
    // At 50 XP, level 1 (min 0, next 100) -> 50%
    const p1 = getXPProgress(50);
    expect(p1.level).toBe(1);
    expect(p1.nextLevel).toBe(2);
    expect(p1.currentProgressXP).toBe(50);
    expect(p1.percentage).toBe(50);

    // At 0 XP -> 0%
    const p0 = getXPProgress(0);
    expect(p0.percentage).toBe(0);

    // At 100 XP -> Level 2, min 100, next 283 -> 0%
    const p2 = getXPProgress(100);
    expect(p2.level).toBe(2);
    expect(p2.currentProgressXP).toBe(0);
    expect(p2.percentage).toBe(0);
  });

  it("calculates XP needed for next level", () => {
    expect(getXPToNextLevel(0)).toBe(100);
    expect(getXPToNextLevel(60)).toBe(40);
    expect(getXPToNextLevel(100)).toBe(183);
  });
});

describe("Progression Engine - Streak System with Timezones", () => {
  it("initializes streak to 1 on very first activity", () => {
    const res = evaluateStreak(0, 0, null, new Date("2026-09-12T10:00:00Z"), "UTC");
    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(1);
    expect(res.streakIncremented).toBe(true);
    expect(res.lastActiveDate).toBe("2026-09-12");
  });

  it("does not increment streak on duplicate completions in the same day", () => {
    const res = evaluateStreak(5, 10, "2026-09-12", new Date("2026-09-12T15:00:00Z"), "UTC");
    expect(res.currentStreak).toBe(5);
    expect(res.longestStreak).toBe(10);
    expect(res.streakIncremented).toBe(false);
    expect(res.isNewDay).toBe(false);
  });

  it("increments streak on consecutive day activity", () => {
    const res = evaluateStreak(3, 3, "2026-09-11", new Date("2026-09-12T08:00:00Z"), "UTC");
    expect(res.currentStreak).toBe(4);
    expect(res.longestStreak).toBe(4);
    expect(res.streakIncremented).toBe(true);
    expect(res.isNewDay).toBe(true);
  });

  it("resets streak to 1 if a calendar day was missed", () => {
    const res = evaluateStreak(7, 10, "2026-09-09", new Date("2026-09-12T10:00:00Z"), "UTC");
    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(10);
    expect(res.streakIncremented).toBe(true);
  });

  it("respects localized timezones for day boundaries", () => {
    // 2026-09-12 23:30 UTC is already 2026-09-13 in Asia/Tokyo (+9)
    const resTokyo = evaluateStreak(
      1,
      1,
      "2026-09-12",
      new Date("2026-09-12T23:30:00Z"),
      "Asia/Tokyo"
    );
    expect(resTokyo.lastActiveDate).toBe("2026-09-13");
    expect(resTokyo.currentStreak).toBe(2);
  });
});

describe("Progression Engine - Reward Matrices", () => {
  it("enforces immutable server reward values", () => {
    expect(DIFFICULTY_REWARDS.EASY).toEqual({ xp: 25, gold: 15, attributeXp: 15 });
    expect(DIFFICULTY_REWARDS.MEDIUM).toEqual({ xp: 50, gold: 35, attributeXp: 30 });
    expect(DIFFICULTY_REWARDS.HARD).toEqual({ xp: 100, gold: 80, attributeXp: 60 });
    expect(DIFFICULTY_REWARDS.EPIC).toEqual({ xp: 250, gold: 200, attributeXp: 150 });
  });
});

describe("Achievement Evaluator", () => {
  it("evaluates FIRST_QUEST achievement when completing first quest", () => {
    const ctx = {
      totalQuestsCompleted: 1,
      currentStreak: 1,
      longestStreak: 1,
      totalXP: 25,
      attributeXP: {
        STRENGTH: 0,
        INTELLECT: 25,
        DISCIPLINE: 0,
        CREATIVITY: 0,
        VITALITY: 0,
        SOCIAL: 0,
      },
      earlyMorningQuestsCount: 0,
    };

    const newAchievements = evaluateNewAchievements(ctx, []);
    expect(newAchievements.map((a) => a.code)).toContain("FIRST_QUEST");
  });

  it("does not re-award already unlocked achievements", () => {
    const ctx = {
      totalQuestsCompleted: 10,
      currentStreak: 1,
      longestStreak: 1,
      totalXP: 300,
      attributeXP: {
        STRENGTH: 0,
        INTELLECT: 100,
        DISCIPLINE: 0,
        CREATIVITY: 0,
        VITALITY: 0,
        SOCIAL: 0,
      },
      earlyMorningQuestsCount: 0,
    };

    const newAchievements = evaluateNewAchievements(ctx, ["ach_first_quest"]);
    expect(newAchievements.map((a) => a.code)).not.toContain("FIRST_QUEST");
  });

  it("awards WEEK_WARRIOR and CENTURION when thresholds are reached", () => {
    const ctx = {
      totalQuestsCompleted: 15,
      currentStreak: 7,
      longestStreak: 7,
      totalXP: 1050,
      attributeXP: {
        STRENGTH: 600,
        INTELLECT: 0,
        DISCIPLINE: 0,
        CREATIVITY: 0,
        VITALITY: 0,
        SOCIAL: 0,
      },
      earlyMorningQuestsCount: 0,
    };

    const newAchievements = evaluateNewAchievements(ctx, ["ach_first_quest"]);
    const codes = newAchievements.map((a) => a.code);
    expect(codes).toContain("WEEK_WARRIOR");
    expect(codes).toContain("CENTURION");
    expect(codes).toContain("POWERHOUSE");
  });
});
