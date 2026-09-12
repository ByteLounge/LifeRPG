import { AttributeType, QuestDifficulty } from "@/lib/game-engine/progression";

export interface DomainUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface DomainProfile {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  timezone: string;
  soundEnabled: boolean;
  theme: string;
  onboarded: boolean;
}

export interface DomainCharacter {
  id: string;
  userId: string;
  name: string;
  level: number;
  totalXp: number;
  gold: number;
  equippedTitleId?: string | null;
  equippedFrameId?: string | null;
  equippedThemeId?: string | null;
}

export interface DomainAttribute {
  id: string;
  characterId: string;
  type: AttributeType;
  currentXp: number;
  level: number;
}

export interface DomainQuest {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: QuestDifficulty;
  attributeType: AttributeType;
  estimatedMinutes: number;
  repeatType: "NONE" | "DAILY" | "WEEKLY";
  dueDate?: Date | null;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
  completedToday?: boolean;
}

export interface DomainQuestCompletion {
  id: string;
  questId: string;
  userId: string;
  xpEarned: number;
  goldEarned: number;
  attributeXpEarned: number;
  completionDate: string; // YYYY-MM-DD
  completedAt: Date;
  idempotencyKey?: string | null;
}

export interface DomainStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface DomainShopItem {
  id: string;
  name: string;
  description: string;
  type: "AVATAR_FRAME" | "THEME" | "TITLE" | "BADGE";
  price: number;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  itemValue: string;
}

export interface DomainUserInventory {
  id: string;
  userId: string;
  itemId: string;
  isEquipped: boolean;
  acquiredAt: Date;
  item: DomainShopItem;
}

export interface DomainAchievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rewardXp: number;
  rewardGold: number;
}

export interface DomainUserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievement: DomainAchievement;
}

export interface ActivityEvent {
  id: string;
  type: "QUEST_COMPLETED" | "LEVEL_UP" | "ACHIEVEMENT_UNLOCKED" | "SHOP_PURCHASE";
  title: string;
  description: string;
  xpEarned?: number;
  goldEarned?: number;
  timestamp: Date;
}

export interface QuestCompletionResult {
  success: boolean;
  quest: DomainQuest;
  completion: DomainQuestCompletion;
  newCharacter: DomainCharacter;
  newStreak: DomainStreak;
  newAttributes: DomainAttribute[];
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  xpEarned: number;
  goldEarned: number;
  unlockedAchievements: DomainAchievement[];
}

export interface IGameRepository {
  findUserByEmail(email: string): Promise<DomainUser | null>;
  findUserById(id: string): Promise<DomainUser | null>;
  createUser(params: {
    email: string;
    passwordHash: string;
    displayName: string;
    characterName?: string;
    timezone?: string;
  }): Promise<{ user: DomainUser; profile: DomainProfile; character: DomainCharacter }>;

  getProfile(userId: string): Promise<DomainProfile | null>;
  updateProfile(userId: string, data: Partial<DomainProfile>): Promise<DomainProfile>;

  getCharacter(userId: string): Promise<{
    character: DomainCharacter;
    attributes: DomainAttribute[];
  } | null>;

  getQuests(userId: string, filter?: { status?: string; category?: string; difficulty?: string }): Promise<DomainQuest[]>;
  getQuestById(userId: string, questId: string): Promise<DomainQuest | null>;
  createQuest(userId: string, data: {
    title: string;
    description?: string;
    category?: string;
    difficulty: QuestDifficulty;
    attributeType: AttributeType;
    estimatedMinutes?: number;
    repeatType?: "NONE" | "DAILY" | "WEEKLY";
    dueDate?: Date | null;
  }): Promise<DomainQuest>;
  updateQuest(userId: string, questId: string, data: Partial<DomainQuest>): Promise<DomainQuest>;
  deleteQuest(userId: string, questId: string): Promise<boolean>;

  completeQuestAtomic(params: {
    userId: string;
    questId: string;
    idempotencyKey?: string;
  }): Promise<QuestCompletionResult>;

  getStreak(userId: string): Promise<DomainStreak>;
  getShopCatalog(): Promise<DomainShopItem[]>;
  getUserInventory(userId: string): Promise<DomainUserInventory[]>;
  purchaseShopItemAtomic(userId: string, itemId: string): Promise<{
    success: boolean;
    remainingGold: number;
    inventoryItem: DomainUserInventory;
  }>;
  equipInventoryItem(userId: string, userInventoryId: string, isEquipped: boolean): Promise<DomainUserInventory>;

  getUserAchievements(userId: string): Promise<{
    allAchievements: DomainAchievement[];
    unlocked: DomainUserAchievement[];
  }>;

  getActivityLedger(userId: string, limit?: number): Promise<ActivityEvent[]>;
}
