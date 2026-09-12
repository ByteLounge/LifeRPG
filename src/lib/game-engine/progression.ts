/**
 * Central Server-Authoritative Progression Engine for Life RPG.
 * All math for XP curves, levels, streak calculation, and reward matrices
 * is strictly isolated here.
 */

export type QuestDifficulty = "EASY" | "MEDIUM" | "HARD" | "EPIC";

export type AttributeType =
  | "STRENGTH"
  | "INTELLECT"
  | "DISCIPLINE"
  | "CREATIVITY"
  | "VITALITY"
  | "SOCIAL";

export interface QuestRewardMatrix {
  xp: number;
  gold: number;
  attributeXp: number;
}

export const DIFFICULTY_REWARDS: Record<QuestDifficulty, QuestRewardMatrix> = {
  EASY: { xp: 25, gold: 15, attributeXp: 15 },
  MEDIUM: { xp: 50, gold: 35, attributeXp: 30 },
  HARD: { xp: 100, gold: 80, attributeXp: 60 },
  EPIC: { xp: 250, gold: 200, attributeXp: 150 },
};

/**
 * Calculates cumulative XP required to reach a specific level.
 * Level 1 starts at 0 XP.
 * XP_TO_LEVEL(N) = round(100 * (N - 1)^1.5) for N >= 1
 * Level 1: 0
 * Level 2: 100
 * Level 3: 283
 * Level 4: 520
 * Level 5: 800
 */
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level - 1, 1.5));
}

/**
 * Determines the current level based on total cumulative XP.
 */
export function getLevelFromXP(totalXP: number): number {
  if (!totalXP || totalXP <= 0) return 1;

  let level = 1;
  while (getXPRequiredForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export interface XPProgressInfo {
  level: number;
  nextLevel: number;
  currentLevelMinXP: number;
  nextLevelXP: number;
  currentProgressXP: number;
  xpNeededForNextLevel: number;
  percentage: number;
}

/**
 * Detailed breakdown of level progress for progress bars and UI.
 */
export function getXPProgress(totalXP: number): XPProgressInfo {
  const safeXP = Math.max(0, totalXP);
  const currentLevel = getLevelFromXP(safeXP);
  const nextLevel = currentLevel + 1;

  const currentLevelMinXP = getXPRequiredForLevel(currentLevel);
  const nextLevelXP = getXPRequiredForLevel(nextLevel);

  const xpNeededForNextLevel = nextLevelXP - currentLevelMinXP;
  const currentProgressXP = safeXP - currentLevelMinXP;

  const percentage =
    xpNeededForNextLevel > 0
      ? Math.min(100, Math.max(0, Math.round((currentProgressXP / xpNeededForNextLevel) * 100)))
      : 0;

  return {
    level: currentLevel,
    nextLevel,
    currentLevelMinXP,
    nextLevelXP,
    currentProgressXP,
    xpNeededForNextLevel,
    percentage,
  };
}

/**
 * XP remaining to advance to the next level.
 */
export function getXPToNextLevel(totalXP: number): number {
  const safeXP = Math.max(0, totalXP);
  const currentLevel = getLevelFromXP(safeXP);
  const nextLevelXP = getXPRequiredForLevel(currentLevel + 1);
  return Math.max(0, nextLevelXP - safeXP);
}

/**
 * Calculate attribute level from attribute XP.
 * Attributes progress with an adjusted curve:
 * AttributeLevel = floor(sqrt(attributeXP / 20)) + 1
 */
export function getAttributeLevelFromXP(attributeXP: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  percentage: number;
} {
  const safeXP = Math.max(0, attributeXP);
  const level = Math.floor(Math.sqrt(safeXP / 25)) + 1;
  const currentLevelMin = Math.round(25 * Math.pow(level - 1, 2));
  const nextLevelMin = Math.round(25 * Math.pow(level, 2));
  const span = nextLevelMin - currentLevelMin;
  const progressInLevel = safeXP - currentLevelMin;
  const percentage = span > 0 ? Math.min(100, Math.max(0, Math.round((progressInLevel / span) * 100))) : 0;

  return {
    level,
    currentXP: safeXP,
    nextLevelXP: nextLevelMin,
    percentage,
  };
}

/**
 * Format date to YYYY-MM-DD in a specific timezone
 */
export function getLocalDateString(date: Date = new Date(), timezone: string = "UTC"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    // Fallback to UTC if timezone is invalid
    return date.toISOString().split("T")[0];
  }
}

export interface StreakEvaluationResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isNewDay: boolean;
  streakIncremented: boolean;
}

/**
 * Evaluates streak based on user's localized calendar date.
 * Server-authoritative logic.
 */
export function evaluateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string | null,
  now: Date = new Date(),
  timezone: string = "UTC"
): StreakEvaluationResult {
  const todayStr = getLocalDateString(now, timezone);

  if (!lastActiveDate) {
    // First ever completed quest
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActiveDate: todayStr,
      isNewDay: true,
      streakIncremented: true,
    };
  }

  if (lastActiveDate === todayStr) {
    // Already logged activity today, streak remains unchanged
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: todayStr,
      isNewDay: false,
      streakIncremented: false,
    };
  }

  // Calculate day difference between today and lastActiveDate
  const todayDate = new Date(`${todayStr}T00:00:00Z`);
  const lastDate = new Date(`${lastActiveDate}T00:00:00Z`);
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActiveDate: todayStr,
      isNewDay: true,
      streakIncremented: true,
    };
  } else {
    // Gap occurred (> 1 day), streak resets to 1
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActiveDate: todayStr,
      isNewDay: true,
      streakIncremented: true,
    };
  }
}
