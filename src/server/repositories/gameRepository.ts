import {
  IGameRepository,
  DomainUser,
  DomainProfile,
  DomainCharacter,
  DomainAttribute,
  DomainQuest,
  DomainQuestCompletion,
  DomainStreak,
  DomainShopItem,
  DomainUserInventory,
  DomainAchievement,
  DomainUserAchievement,
  ActivityEvent,
  QuestCompletionResult,
} from "./types";
import {
  AttributeType,
  QuestDifficulty,
  DIFFICULTY_REWARDS,
  getLevelFromXP,
  evaluateStreak,
  getLocalDateString,
  getAttributeLevelFromXP,
} from "@/lib/game-engine/progression";
import { ACHIEVEMENTS, evaluateNewAchievements } from "@/lib/game-engine/achievements";
import { SEED_CATEGORIES, SEED_SHOP_ITEMS, STARTER_QUESTS } from "@/lib/game-engine/seed-data";
import { prisma } from "@/lib/db/prisma";

const ALL_ATTRIBUTES: AttributeType[] = [
  "STRENGTH",
  "INTELLECT",
  "DISCIPLINE",
  "CREATIVITY",
  "VITALITY",
  "SOCIAL",
];

/**
 * In-memory Mock Store for resilient test suites, offline development,
 * and zero-config local demos.
 */
class MemoryGameStore {
  users = new Map<string, DomainUser>();
  profiles = new Map<string, DomainProfile>();
  characters = new Map<string, DomainCharacter>();
  attributes = new Map<string, DomainAttribute[]>();
  quests = new Map<string, DomainQuest>();
  completions: DomainQuestCompletion[] = [];
  streaks = new Map<string, DomainStreak>();
  inventory = new Map<string, DomainUserInventory[]>();
  purchases: Array<{ id: string; userId: string; itemId: string; pricePaid: number; createdAt: Date }> = [];
  unlockedAchievements = new Map<string, DomainUserAchievement[]>();
  activities: ActivityEvent[] = [];

  constructor() {
    this.initCatalog();
  }

  private initCatalog() {
    // Catalog initialized from seed data
  }
}

const globalForGame = globalThis as unknown as {
  memoryStore?: MemoryGameStore;
  isPrismaAvailable?: boolean;
};

if (!globalForGame.memoryStore) {
  globalForGame.memoryStore = new MemoryGameStore();
}
const memoryStore = globalForGame.memoryStore;

/**
 * Checks if Prisma can connect to a live PostgreSQL database.
 * Caches result on globalThis so zero-config demo mode runs instantly with 0ms overhead.
 */
async function checkPrisma(): Promise<boolean> {
  if (globalForGame.isPrismaAvailable !== undefined) {
    return globalForGame.isPrismaAvailable;
  }
  if (!process.env.DATABASE_URL || process.env.NODE_ENV === "test" || process.env.DEMO_STORAGE_FALLBACK === "true") {
    globalForGame.isPrismaAvailable = false;
    return false;
  }

  // Allow adequate time for remote SSL handshakes (e.g. Supabase), but fast-fail on missing local postgres
  const dbUrl = process.env.DATABASE_URL;
  const isLocalhost = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
  const timeoutMs = isLocalhost ? 200 : 5000;

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), timeoutMs)),
    ]);
    globalForGame.isPrismaAvailable = true;
    return true;
  } catch (err) {
    if (!isLocalhost || process.env.NODE_ENV === "production") {
      console.warn("Could not reach database via DATABASE_URL:", (err as Error)?.message || err);
    }
    globalForGame.isPrismaAvailable = false;
    return false;
  }
}

export class GameRepository implements IGameRepository {
  async findUserByEmail(email: string): Promise<DomainUser | null> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      return u ? { id: u.id, email: u.email, passwordHash: u.passwordHash, createdAt: u.createdAt } : null;
    }

    for (const u of memoryStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<DomainUser | null> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const u = await prisma.user.findUnique({ where: { id } });
      return u ? { id: u.id, email: u.email, passwordHash: u.passwordHash, createdAt: u.createdAt } : null;
    }
    return memoryStore.users.get(id) || null;
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
    displayName: string;
    characterName?: string;
    timezone?: string;
  }): Promise<{ user: DomainUser; profile: DomainProfile; character: DomainCharacter }> {
    const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const profileId = `prf_${Math.random().toString(36).substring(2, 11)}`;
    const characterId = `chr_${Math.random().toString(36).substring(2, 11)}`;
    const streakId = `stk_${Math.random().toString(36).substring(2, 11)}`;
    const tz = params.timezone || "UTC";
    const charName = params.characterName || params.displayName;

    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const created = await prisma.user.create({
        data: {
          email: params.email.toLowerCase(),
          passwordHash: params.passwordHash,
          profile: {
            create: {
              displayName: params.displayName,
              timezone: tz,
              avatar: "hero-warrior",
              soundEnabled: true,
              theme: "dark",
              onboarded: true,
            },
          },
          character: {
            create: {
              name: charName,
              level: 1,
              totalXp: 0,
              gold: 150, // starter purse
              attributes: {
                create: ALL_ATTRIBUTES.map((type) => ({
                  type,
                  currentXp: 0,
                  level: 1,
                })),
              },
            },
          },
          streak: {
            create: {
              currentStreak: 0,
              longestStreak: 0,
              lastActiveDate: null,
            },
          },
        },
        include: {
          profile: true,
          character: true,
        },
      });

      // Seed starter quests for user
      for (const sq of STARTER_QUESTS) {
        await prisma.quest.create({
          data: {
            userId: created.id,
            title: sq.title,
            description: sq.description,
            category: sq.category,
            difficulty: sq.difficulty,
            attributeType: sq.attributeType,
            estimatedMinutes: sq.estimatedMinutes,
            repeatType: sq.repeatType,
            status: "ACTIVE",
          },
        });
      }

      return {
        user: { id: created.id, email: created.email, passwordHash: created.passwordHash, createdAt: created.createdAt },
        profile: {
          id: created.profile!.id,
          userId: created.id,
          displayName: created.profile!.displayName,
          avatar: created.profile!.avatar,
          timezone: created.profile!.timezone,
          soundEnabled: created.profile!.soundEnabled,
          theme: created.profile!.theme,
          onboarded: created.profile!.onboarded,
        },
        character: {
          id: created.character!.id,
          userId: created.id,
          name: created.character!.name,
          level: created.character!.level,
          totalXp: created.character!.totalXp,
          gold: created.character!.gold,
          equippedTitleId: created.character!.equippedTitleId,
          equippedFrameId: created.character!.equippedFrameId,
          equippedThemeId: created.character!.equippedThemeId,
        },
      };
    }

    // Memory Store Implementation
    const user: DomainUser = {
      id: userId,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      createdAt: new Date(),
    };
    const profile: DomainProfile = {
      id: profileId,
      userId,
      displayName: params.displayName,
      avatar: "hero-warrior",
      timezone: tz,
      soundEnabled: true,
      theme: "dark",
      onboarded: true,
    };
    const character: DomainCharacter = {
      id: characterId,
      userId,
      name: charName,
      level: 1,
      totalXp: 0,
      gold: 150,
      equippedTitleId: null,
      equippedFrameId: null,
      equippedThemeId: null,
    };
    const attributes: DomainAttribute[] = ALL_ATTRIBUTES.map((type) => ({
      id: `attr_${type.toLowerCase()}_${userId}`,
      characterId,
      type,
      currentXp: 0,
      level: 1,
    }));
    const streak: DomainStreak = {
      id: streakId,
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };

    memoryStore.users.set(userId, user);
    memoryStore.profiles.set(userId, profile);
    memoryStore.characters.set(userId, character);
    memoryStore.attributes.set(characterId, attributes);
    memoryStore.streaks.set(userId, streak);
    memoryStore.inventory.set(userId, []);
    memoryStore.unlockedAchievements.set(userId, []);

    // Create starter quests in memory
    for (const sq of STARTER_QUESTS) {
      const qId = `qst_${Math.random().toString(36).substring(2, 9)}`;
      const q: DomainQuest = {
        id: qId,
        userId,
        title: sq.title,
        description: sq.description,
        category: sq.category,
        difficulty: sq.difficulty,
        attributeType: sq.attributeType,
        estimatedMinutes: sq.estimatedMinutes,
        repeatType: sq.repeatType,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.quests.set(qId, q);
    }

    return { user, profile, character };
  }

  async getProfile(userId: string): Promise<DomainProfile | null> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const p = await prisma.profile.findUnique({ where: { userId } });
      return p
        ? {
            id: p.id,
            userId: p.userId,
            displayName: p.displayName,
            avatar: p.avatar,
            timezone: p.timezone,
            soundEnabled: p.soundEnabled,
            theme: p.theme,
            onboarded: p.onboarded,
          }
        : null;
    }
    return memoryStore.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, data: Partial<DomainProfile>): Promise<DomainProfile> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const updated = await prisma.profile.update({
        where: { userId },
        data: {
          displayName: data.displayName,
          avatar: data.avatar,
          timezone: data.timezone,
          soundEnabled: data.soundEnabled,
          theme: data.theme,
          onboarded: data.onboarded,
        },
      });
      return {
        id: updated.id,
        userId: updated.userId,
        displayName: updated.displayName,
        avatar: updated.avatar,
        timezone: updated.timezone,
        soundEnabled: updated.soundEnabled,
        theme: updated.theme,
        onboarded: updated.onboarded,
      };
    }
    const current = memoryStore.profiles.get(userId);
    if (!current) throw new Error("Profile not found");
    const merged = { ...current, ...data };
    memoryStore.profiles.set(userId, merged);
    return merged;
  }

  async getCharacter(userId: string): Promise<{ character: DomainCharacter; attributes: DomainAttribute[] } | null> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const c = await prisma.character.findUnique({
        where: { userId },
        include: { attributes: true },
      });
      if (!c) return null;
      return {
        character: {
          id: c.id,
          userId: c.userId,
          name: c.name,
          level: c.level,
          totalXp: c.totalXp,
          gold: c.gold,
          equippedTitleId: c.equippedTitleId,
          equippedFrameId: c.equippedFrameId,
          equippedThemeId: c.equippedThemeId,
        },
        attributes: c.attributes.map((a) => ({
          id: a.id,
          characterId: a.characterId,
          type: a.type as AttributeType,
          currentXp: a.currentXp,
          level: a.level,
        })),
      };
    }

    const c = memoryStore.characters.get(userId);
    if (!c) return null;
    let attrs = memoryStore.attributes.get(c.id);
    if (!attrs || attrs.length === 0) {
      attrs = ALL_ATTRIBUTES.map((type) => ({
        id: `attr_${type.toLowerCase()}_${c.id}`,
        characterId: c.id,
        type,
        currentXp: 0,
        level: 1,
      }));
      memoryStore.attributes.set(c.id, attrs);
    }
    return { character: { ...c }, attributes: attrs.map((a) => ({ ...a })) };
  }

  async getQuests(
    userId: string,
    filter?: { status?: string; category?: string; difficulty?: string }
  ): Promise<DomainQuest[]> {
    const usePrisma = await checkPrisma();
    const profile = await this.getProfile(userId);
    const todayStr = getLocalDateString(new Date(), profile?.timezone || "UTC");

    if (usePrisma) {
      const list = await prisma.quest.findMany({
        where: {
          userId,
          ...(filter?.status ? { status: filter.status } : {}),
          ...(filter?.category ? { category: filter.category } : {}),
          ...(filter?.difficulty ? { difficulty: filter.difficulty } : {}),
        },
        include: {
          completions: {
            where: { completionDate: todayStr },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return list.map((q) => ({
        id: q.id,
        userId: q.userId,
        title: q.title,
        description: q.description,
        category: q.category,
        difficulty: q.difficulty as QuestDifficulty,
        attributeType: q.attributeType as AttributeType,
        estimatedMinutes: q.estimatedMinutes,
        repeatType: q.repeatType as "NONE" | "DAILY" | "WEEKLY",
        dueDate: q.dueDate,
        status: q.status as "ACTIVE" | "COMPLETED" | "ARCHIVED",
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        completedToday: q.completions.length > 0,
      }));
    }

    // In-memory filter
    const results: DomainQuest[] = [];
    for (const q of memoryStore.quests.values()) {
      if (q.userId !== userId) continue;
      if (filter?.status && q.status !== filter.status) continue;
      if (filter?.category && q.category !== filter.category) continue;
      if (filter?.difficulty && q.difficulty !== filter.difficulty) continue;

      const completedToday = memoryStore.completions.some(
        (c) => c.questId === q.id && c.completionDate === todayStr
      );

      results.push({ ...q, completedToday });
    }
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getQuestById(userId: string, questId: string): Promise<DomainQuest | null> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const q = await prisma.quest.findFirst({
        where: { id: questId, userId },
      });
      if (!q) return null;
      return {
        id: q.id,
        userId: q.userId,
        title: q.title,
        description: q.description,
        category: q.category,
        difficulty: q.difficulty as QuestDifficulty,
        attributeType: q.attributeType as AttributeType,
        estimatedMinutes: q.estimatedMinutes,
        repeatType: q.repeatType as "NONE" | "DAILY" | "WEEKLY",
        dueDate: q.dueDate,
        status: q.status as "ACTIVE" | "COMPLETED" | "ARCHIVED",
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    }
    const q = memoryStore.quests.get(questId);
    if (!q || q.userId !== userId) return null;
    return q;
  }

  async createQuest(
    userId: string,
    data: {
      title: string;
      description?: string;
      category?: string;
      difficulty: QuestDifficulty;
      attributeType: AttributeType;
      estimatedMinutes?: number;
      repeatType?: "NONE" | "DAILY" | "WEEKLY";
      dueDate?: Date | null;
    }
  ): Promise<DomainQuest> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const created = await prisma.quest.create({
        data: {
          userId,
          title: data.title.trim(),
          description: data.description?.trim(),
          category: data.category || "General",
          difficulty: data.difficulty,
          attributeType: data.attributeType,
          estimatedMinutes: data.estimatedMinutes || 30,
          repeatType: data.repeatType || "NONE",
          dueDate: data.dueDate || null,
          status: "ACTIVE",
        },
      });
      return {
        id: created.id,
        userId: created.userId,
        title: created.title,
        description: created.description,
        category: created.category,
        difficulty: created.difficulty as QuestDifficulty,
        attributeType: created.attributeType as AttributeType,
        estimatedMinutes: created.estimatedMinutes,
        repeatType: created.repeatType as "NONE" | "DAILY" | "WEEKLY",
        dueDate: created.dueDate,
        status: created.status as "ACTIVE" | "COMPLETED" | "ARCHIVED",
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    }

    const questId = `qst_${Math.random().toString(36).substring(2, 9)}`;
    const q: DomainQuest = {
      id: questId,
      userId,
      title: data.title.trim(),
      description: data.description?.trim(),
      category: data.category || "General",
      difficulty: data.difficulty,
      attributeType: data.attributeType,
      estimatedMinutes: data.estimatedMinutes || 30,
      repeatType: data.repeatType || "NONE",
      dueDate: data.dueDate || null,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.quests.set(questId, q);
    return q;
  }

  async updateQuest(userId: string, questId: string, data: Partial<DomainQuest>): Promise<DomainQuest> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const updated = await prisma.quest.update({
        where: { id: questId, userId },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          attributeType: data.attributeType,
          estimatedMinutes: data.estimatedMinutes,
          repeatType: data.repeatType,
          dueDate: data.dueDate,
          status: data.status,
        },
      });
      return {
        id: updated.id,
        userId: updated.userId,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        difficulty: updated.difficulty as QuestDifficulty,
        attributeType: updated.attributeType as AttributeType,
        estimatedMinutes: updated.estimatedMinutes,
        repeatType: updated.repeatType as "NONE" | "DAILY" | "WEEKLY",
        dueDate: updated.dueDate,
        status: updated.status as "ACTIVE" | "COMPLETED" | "ARCHIVED",
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }

    const q = memoryStore.quests.get(questId);
    if (!q || q.userId !== userId) throw new Error("Quest not found or unauthorized");
    const merged: DomainQuest = { ...q, ...data, updatedAt: new Date() };
    memoryStore.quests.set(questId, merged);
    return merged;
  }

  async deleteQuest(userId: string, questId: string): Promise<boolean> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      await prisma.quest.deleteMany({
        where: { id: questId, userId },
      });
      return true;
    }
    const q = memoryStore.quests.get(questId);
    if (!q || q.userId !== userId) return false;
    memoryStore.quests.delete(questId);
    return true;
  }

  /**
   * ATOMIC SERVER-AUTHORITATIVE QUEST COMPLETION
   * Completely calculates rewards server-side, updates streak with timezone,
   * updates attributes, checks for level up, and unlocks achievements.
   */
  async completeQuestAtomic(params: {
    userId: string;
    questId: string;
    idempotencyKey?: string;
  }): Promise<QuestCompletionResult> {
    const { userId, questId, idempotencyKey } = params;
    const now = new Date();

    const profile = await this.getProfile(userId);
    const tz = profile?.timezone || "UTC";
    const todayStr = getLocalDateString(now, tz);

    const quest = await this.getQuestById(userId, questId);
    if (!quest) throw new Error("Quest not found or unauthorized.");

    // Prevent duplicate completion
    if (quest.repeatType === "NONE" && quest.status === "COMPLETED") {
      throw new Error("This one-time quest has already been completed.");
    }

    // Server-authoritative rewards calculation
    const rewards = DIFFICULTY_REWARDS[quest.difficulty] || DIFFICULTY_REWARDS.MEDIUM;
    const xpEarned = rewards.xp;
    const goldEarned = rewards.gold;
    const attributeXpEarned = rewards.attributeXp;

    const charData = await this.getCharacter(userId);
    if (!charData) throw new Error("Character not found.");
    const { character, attributes } = charData;

    const currentStreakData = await this.getStreak(userId);
    const streakResult = evaluateStreak(
      currentStreakData.currentStreak,
      currentStreakData.longestStreak,
      currentStreakData.lastActiveDate,
      now,
      tz
    );

    const oldLevel = character.level;
    const newTotalXp = character.totalXp + xpEarned;
    const newLevel = getLevelFromXP(newTotalXp);
    const leveledUp = newLevel > oldLevel;
    const newGold = character.gold + goldEarned;

    // Attribute update
    const updatedAttributes = attributes.map((attr) => {
      if (attr.type === quest.attributeType) {
        const newAttrXp = attr.currentXp + attributeXpEarned;
        const attrLvl = getAttributeLevelFromXP(newAttrXp);
        return {
          ...attr,
          currentXp: newAttrXp,
          level: attrLvl.level,
        };
      }
      return attr;
    });

    const completionId = `cmp_${Math.random().toString(36).substring(2, 10)}`;
    const completion: DomainQuestCompletion = {
      id: completionId,
      questId,
      userId,
      xpEarned,
      goldEarned,
      attributeXpEarned,
      completionDate: todayStr,
      completedAt: now,
      idempotencyKey: idempotencyKey || null,
    };

    const newStreak: DomainStreak = {
      id: currentStreakData.id,
      userId,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      lastActiveDate: streakResult.lastActiveDate,
    };

    const newCharacter: DomainCharacter = {
      ...character,
      level: newLevel,
      totalXp: newTotalXp,
      gold: newGold,
    };

    // Evaluate Achievements
    const userAchData = await this.getUserAchievements(userId);
    const alreadyUnlockedCodes = userAchData.unlocked.map((u) => u.achievement.code);
    const attrMap: Record<AttributeType, number> = {
      STRENGTH: 0,
      INTELLECT: 0,
      DISCIPLINE: 0,
      CREATIVITY: 0,
      VITALITY: 0,
      SOCIAL: 0,
    };
    updatedAttributes.forEach((a) => {
      attrMap[a.type] = a.currentXp;
    });

    const unlockedAchs = evaluateNewAchievements(
      {
        totalQuestsCompleted: (userAchData.unlocked.length > 0 ? 1 : 0) + 1,
        currentStreak: newStreak.currentStreak,
        longestStreak: newStreak.longestStreak,
        totalXP: newTotalXp,
        attributeXP: attrMap,
        earlyMorningQuestsCount: now.getUTCHours() < 12 ? 1 : 0,
      },
      alreadyUnlockedCodes
    );

    // If achievements give bonus rewards
    for (const a of unlockedAchs) {
      newCharacter.totalXp += a.rewardXp;
      newCharacter.gold += a.rewardGold;
    }

    const usePrisma = await checkPrisma();
    if (usePrisma) {
      // Execute in PostgreSQL Transaction
      await prisma.$transaction(async (tx) => {
        // 1. Record completion
        await tx.questCompletion.create({
          data: {
            questId,
            userId,
            xpEarned,
            goldEarned,
            attributeXpEarned,
            completionDate: todayStr,
            idempotencyKey: idempotencyKey || null,
          },
        });

        // 2. If one-time quest, mark completed
        if (quest.repeatType === "NONE") {
          await tx.quest.update({
            where: { id: questId },
            data: { status: "COMPLETED" },
          });
        }

        // 3. XP Transaction Ledger
        await tx.xpTransaction.create({
          data: {
            userId,
            amount: xpEarned,
            sourceType: "QUEST_COMPLETION",
            sourceId: questId,
          },
        });

        // 4. Currency Transaction Ledger
        await tx.currencyTransaction.create({
          data: {
            userId,
            amount: goldEarned,
            type: "CREDIT",
            source: "QUEST_COMPLETION",
            referenceId: questId,
          },
        });

        // 5. Update Character
        await tx.character.update({
          where: { userId },
          data: {
            level: newLevel,
            totalXp: newCharacter.totalXp,
            gold: newCharacter.gold,
          },
        });

        // 6. Update Attributes
        for (const attr of updatedAttributes) {
          if (attr.type === quest.attributeType) {
            await tx.attribute.updateMany({
              where: { characterId: character.id, type: attr.type },
              data: { currentXp: attr.currentXp, level: attr.level },
            });
          }
        }

        // 7. Update Streak
        await tx.streak.upsert({
          where: { userId },
          update: {
            currentStreak: newStreak.currentStreak,
            longestStreak: newStreak.longestStreak,
            lastActiveDate: newStreak.lastActiveDate,
          },
          create: {
            userId,
            currentStreak: newStreak.currentStreak,
            longestStreak: newStreak.longestStreak,
            lastActiveDate: newStreak.lastActiveDate,
          },
        });

        // 8. Record Unlocked Achievements
        for (const a of unlockedAchs) {
          const dbAch = await tx.achievement.findUnique({ where: { code: a.code } });
          if (dbAch) {
            await tx.userAchievement.create({
              data: {
                userId,
                achievementId: dbAch.id,
              },
            });
          }
        }
      });
    } else {
      // In-Memory Transaction commit
      memoryStore.completions.push(completion);
      if (quest.repeatType === "NONE") {
        quest.status = "COMPLETED";
        memoryStore.quests.set(questId, { ...quest, status: "COMPLETED" });
      }
      memoryStore.characters.set(userId, newCharacter);
      memoryStore.attributes.set(character.id, updatedAttributes);
      memoryStore.streaks.set(userId, newStreak);

      const existingUserAchs = memoryStore.unlockedAchievements.get(userId) || [];
      for (const a of unlockedAchs) {
        existingUserAchs.push({
          id: `uach_${Math.random().toString(36).substring(2, 9)}`,
          userId,
          achievementId: a.id,
          unlockedAt: now,
          achievement: {
            id: a.id,
            code: a.code,
            name: a.name,
            description: a.description,
            icon: a.icon,
            rewardXp: a.rewardXp,
            rewardGold: a.rewardGold,
          },
        });
      }
      memoryStore.unlockedAchievements.set(userId, existingUserAchs);

      memoryStore.activities.unshift({
        id: `act_${Math.random().toString(36).substring(2, 9)}`,
        type: "QUEST_COMPLETED",
        title: `Completed Quest: "${quest.title}"`,
        description: `+${xpEarned} XP, +${goldEarned} Gold, +${attributeXpEarned} ${quest.attributeType} XP`,
        xpEarned,
        goldEarned,
        timestamp: now,
      });

      if (leveledUp) {
        memoryStore.activities.unshift({
          id: `act_${Math.random().toString(36).substring(2, 9)}`,
          type: "LEVEL_UP",
          title: `Leveled Up to Level ${newLevel}!`,
          description: `Your relentless discipline elevated you to level ${newLevel}.`,
          timestamp: now,
        });
      }
    }

    return {
      success: true,
      quest: { ...quest, status: quest.repeatType === "NONE" ? "COMPLETED" : quest.status, completedToday: true },
      completion,
      newCharacter,
      newStreak,
      newAttributes: updatedAttributes,
      leveledUp,
      oldLevel,
      newLevel,
      xpEarned,
      goldEarned,
      unlockedAchievements: unlockedAchs.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        icon: a.icon,
        rewardXp: a.rewardXp,
        rewardGold: a.rewardGold,
      })),
    };
  }

  async getStreak(userId: string): Promise<DomainStreak> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const s = await prisma.streak.findUnique({ where: { userId } });
      if (s) {
        return {
          id: s.id,
          userId: s.userId,
          currentStreak: s.currentStreak,
          longestStreak: s.longestStreak,
          lastActiveDate: s.lastActiveDate,
        };
      }
    }
    const memStreak = memoryStore.streaks.get(userId);
    if (memStreak) return memStreak;

    const fallback: DomainStreak = {
      id: `stk_${userId}`,
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };
    memoryStore.streaks.set(userId, fallback);
    return fallback;
  }

  async getShopCatalog(): Promise<DomainShopItem[]> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const items = await prisma.shopItem.findMany({ where: { isAvailable: true } });
      if (items.length > 0) {
        return items.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          type: i.type as "AVATAR_FRAME" | "THEME" | "TITLE" | "BADGE",
          price: i.price,
          icon: i.icon,
          rarity: i.rarity as "COMMON" | "RARE" | "EPIC" | "LEGENDARY",
          itemValue: i.itemValue,
        }));
      }
    }
    return SEED_SHOP_ITEMS;
  }

  async getUserInventory(userId: string): Promise<DomainUserInventory[]> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const inv = await prisma.userInventory.findMany({
        where: { userId },
        include: { item: true },
      });
      return inv.map((i) => ({
        id: i.id,
        userId: i.userId,
        itemId: i.itemId,
        isEquipped: i.isEquipped,
        acquiredAt: i.acquiredAt,
        item: {
          id: i.item.id,
          name: i.item.name,
          description: i.item.description,
          type: i.item.type as "AVATAR_FRAME" | "THEME" | "TITLE" | "BADGE",
          price: i.item.price,
          icon: i.item.icon,
          rarity: i.item.rarity as "COMMON" | "RARE" | "EPIC" | "LEGENDARY",
          itemValue: i.item.itemValue,
        },
      }));
    }
    return memoryStore.inventory.get(userId) || [];
  }

  async purchaseShopItemAtomic(
    userId: string,
    itemId: string
  ): Promise<{ success: boolean; remainingGold: number; inventoryItem: DomainUserInventory }> {
    const catalog = await this.getShopCatalog();
    const item = catalog.find((i) => i.id === itemId);
    if (!item) throw new Error("Shop item not found or unavailable.");

    const charData = await this.getCharacter(userId);
    if (!charData) throw new Error("Character not found.");
    const { character } = charData;

    // Verify sufficient balance
    if (character.gold < item.price) {
      throw new Error(`Insufficient gold. You have ${character.gold} gold, but this item costs ${item.price} gold.`);
    }

    // Verify item not already owned
    const inventory = await this.getUserInventory(userId);
    if (inventory.some((i) => i.itemId === itemId)) {
      throw new Error("You already possess this unique item in your inventory.");
    }

    const remainingGold = character.gold - item.price;
    const now = new Date();
    const inventoryId = `inv_${Math.random().toString(36).substring(2, 9)}`;

    const newInventoryItem: DomainUserInventory = {
      id: inventoryId,
      userId,
      itemId: item.id,
      isEquipped: false,
      acquiredAt: now,
      item,
    };

    const usePrisma = await checkPrisma();
    if (usePrisma) {
      await prisma.$transaction(async (tx) => {
        // 1. Deduct gold
        await tx.character.update({
          where: { userId },
          data: { gold: remainingGold },
        });

        // 2. Record ledger
        await tx.currencyTransaction.create({
          data: {
            userId,
            amount: item.price,
            type: "DEBIT",
            source: "SHOP_PURCHASE",
            referenceId: item.id,
          },
        });

        // 3. Record purchase
        await tx.purchase.create({
          data: {
            userId,
            itemId: item.id,
            pricePaid: item.price,
          },
        });

        // 4. Add to inventory
        await tx.userInventory.create({
          data: {
            id: inventoryId,
            userId,
            itemId: item.id,
            isEquipped: false,
          },
        });
      });
    } else {
      character.gold = remainingGold;
      memoryStore.characters.set(userId, character);
      const userInv = memoryStore.inventory.get(userId) || [];
      userInv.push(newInventoryItem);
      memoryStore.inventory.set(userId, userInv);
      memoryStore.purchases.push({
        id: `pch_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        itemId: item.id,
        pricePaid: item.price,
        createdAt: now,
      });
      memoryStore.activities.unshift({
        id: `act_${Math.random().toString(36).substring(2, 9)}`,
        type: "SHOP_PURCHASE",
        title: `Purchased: ${item.name}`,
        description: `Spent ${item.price} gold to acquire ${item.name}.`,
        goldEarned: -item.price,
        timestamp: now,
      });
    }

    return {
      success: true,
      remainingGold,
      inventoryItem: newInventoryItem,
    };
  }

  async equipInventoryItem(
    userId: string,
    userInventoryId: string,
    isEquipped: boolean
  ): Promise<DomainUserInventory> {
    const userInv = await this.getUserInventory(userId);
    const target = userInv.find((i) => i.id === userInventoryId);
    if (!target) throw new Error("Inventory item not found or unauthorized.");

    const charData = await this.getCharacter(userId);
    if (!charData) throw new Error("Character not found.");
    const { character } = charData;

    // Update equipped slot on character
    if (target.item.type === "AVATAR_FRAME") {
      character.equippedFrameId = isEquipped ? target.item.itemValue : null;
    } else if (target.item.type === "TITLE") {
      character.equippedTitleId = isEquipped ? target.item.itemValue : null;
    } else if (target.item.type === "THEME") {
      character.equippedThemeId = isEquipped ? target.item.itemValue : null;
    }

    const usePrisma = await checkPrisma();
    if (usePrisma) {
      // Unequip others of same type if equipping
      if (isEquipped) {
        const sameTypeItems = userInv.filter((i) => i.item.type === target.item.type && i.id !== target.id);
        if (sameTypeItems.length > 0) {
          await prisma.userInventory.updateMany({
            where: { id: { in: sameTypeItems.map((i) => i.id) } },
            data: { isEquipped: false },
          });
        }
      }

      await prisma.userInventory.update({
        where: { id: target.id },
        data: { isEquipped },
      });

      await prisma.character.update({
        where: { userId },
        data: {
          equippedFrameId: character.equippedFrameId,
          equippedTitleId: character.equippedTitleId,
          equippedThemeId: character.equippedThemeId,
        },
      });
    } else {
      // In-Memory
      const currentList = memoryStore.inventory.get(userId) || [];
      for (const item of currentList) {
        if (item.item.type === target.item.type) {
          item.isEquipped = item.id === target.id ? isEquipped : false;
        }
      }
      memoryStore.characters.set(userId, character);
    }

    return { ...target, isEquipped };
  }

  async getUserAchievements(userId: string): Promise<{
    allAchievements: DomainAchievement[];
    unlocked: DomainUserAchievement[];
  }> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const all = await prisma.achievement.findMany();
      const unlocked = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      });
      return {
        allAchievements: all.map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          description: a.description,
          icon: a.icon,
          rewardXp: a.rewardXp,
          rewardGold: a.rewardGold,
        })),
        unlocked: unlocked.map((u) => ({
          id: u.id,
          userId: u.userId,
          achievementId: u.achievementId,
          unlockedAt: u.unlockedAt,
          achievement: {
            id: u.achievement.id,
            code: u.achievement.code,
            name: u.achievement.name,
            description: u.achievement.description,
            icon: u.achievement.icon,
            rewardXp: u.achievement.rewardXp,
            rewardGold: u.achievement.rewardGold,
          },
        })),
      };
    }

    const allAchievements = ACHIEVEMENTS.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      rewardXp: a.rewardXp,
      rewardGold: a.rewardGold,
    }));
    const unlocked = memoryStore.unlockedAchievements.get(userId) || [];
    return { allAchievements, unlocked };
  }

  async getActivityLedger(userId: string, limit: number = 20): Promise<ActivityEvent[]> {
    const usePrisma = await checkPrisma();
    if (usePrisma) {
      const completions = await prisma.questCompletion.findMany({
        where: { userId },
        include: { quest: true },
        orderBy: { completedAt: "desc" },
        take: limit,
      });

      return completions.map((c) => ({
        id: c.id,
        type: "QUEST_COMPLETED",
        title: `Completed "${c.quest.title}"`,
        description: `+${c.xpEarned} XP, +${c.goldEarned} Gold, +${c.attributeXpEarned} ${c.quest.attributeType}`,
        xpEarned: c.xpEarned,
        goldEarned: c.goldEarned,
        timestamp: c.completedAt,
      }));
    }

    return (memoryStore.activities || []).slice(0, limit);
  }
}

export const gameRepository = new GameRepository();
