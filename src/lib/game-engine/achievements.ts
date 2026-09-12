import { AttributeType } from "./progression";

export interface AchievementDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rewardXp: number;
  rewardGold: number;
  check: (context: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalQuestsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  attributeXP: Record<AttributeType, number>;
  earlyMorningQuestsCount: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "ach_first_quest",
    code: "FIRST_QUEST",
    name: "First Steps",
    description: "Complete your first quest and start your hero's journey.",
    icon: "⚔️",
    rewardXp: 50,
    rewardGold: 25,
    check: (ctx) => ctx.totalQuestsCompleted >= 1,
  },
  {
    id: "ach_week_warrior",
    code: "WEEK_WARRIOR",
    name: "Week Warrior",
    description: "Maintain a daily quest streak for 7 consecutive days.",
    icon: "🔥",
    rewardXp: 150,
    rewardGold: 100,
    check: (ctx) => ctx.currentStreak >= 7 || ctx.longestStreak >= 7,
  },
  {
    id: "ach_centurion",
    code: "CENTURION",
    name: "Centurion",
    description: "Amass a total of 1,000 XP across all quests.",
    icon: "🛡️",
    rewardXp: 200,
    rewardGold: 150,
    check: (ctx) => ctx.totalXP >= 1000,
  },
  {
    id: "ach_quest_master",
    code: "QUEST_MASTER",
    name: "Quest Master",
    description: "Complete 25 total quests.",
    icon: "👑",
    rewardXp: 500,
    rewardGold: 300,
    check: (ctx) => ctx.totalQuestsCompleted >= 25,
  },
  {
    id: "ach_scholar",
    code: "SCHOLAR",
    name: "Grand Scholar",
    description: "Reach 500 Intellect XP through knowledge and study quests.",
    icon: "📜",
    rewardXp: 200,
    rewardGold: 120,
    check: (ctx) => (ctx.attributeXP.INTELLECT || 0) >= 500,
  },
  {
    id: "ach_powerhouse",
    code: "POWERHOUSE",
    name: "Powerhouse",
    description: "Reach 500 Strength XP through physical conditioning quests.",
    icon: "💪",
    rewardXp: 200,
    rewardGold: 120,
    check: (ctx) => (ctx.attributeXP.STRENGTH || 0) >= 500,
  },
  {
    id: "ach_disciplined",
    code: "DISCIPLINED_MIND",
    name: "Iron Will",
    description: "Reach 500 Discipline XP through focus and consistency.",
    icon: "🧘",
    rewardXp: 200,
    rewardGold: 120,
    check: (ctx) => (ctx.attributeXP.DISCIPLINE || 0) >= 500,
  },
  {
    id: "ach_creator",
    code: "MASTER_CREATOR",
    name: "Master Creator",
    description: "Reach 500 Creativity XP through creative and design work.",
    icon: "🎨",
    rewardXp: 200,
    rewardGold: 120,
    check: (ctx) => (ctx.attributeXP.CREATIVITY || 0) >= 500,
  },
  {
    id: "ach_vitality",
    code: "VITAL_VIGOR",
    name: "Vital Vigor",
    description: "Reach 500 Vitality XP through health and wellness quests.",
    icon: "🌿",
    rewardXp: 200,
    rewardGold: 120,
    check: (ctx) => (ctx.attributeXP.VITALITY || 0) >= 500,
  },
  {
    id: "ach_social",
    code: "SOCIAL_BUTTERFLY",
    name: "Renowned Diplomat",
    description: "Reach 500 Social XP through connection and collaboration.",
    icon: "🤝",
    rewardXp: 200,
    rewardGold: 120,
    check: (ctx) => (ctx.attributeXP.SOCIAL || 0) >= 500,
  },
];

/**
 * Server-side evaluation of newly earned achievements.
 * Returns only the achievements that the user qualifies for and has not yet unlocked.
 */
export function evaluateNewAchievements(
  context: AchievementContext,
  alreadyUnlockedIds: string[]
): AchievementDefinition[] {
  const unlockedSet = new Set(alreadyUnlockedIds);
  return ACHIEVEMENTS.filter((ach) => !unlockedSet.has(ach.id) && ach.check(context));
}
