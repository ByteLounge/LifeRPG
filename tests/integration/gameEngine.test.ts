import { describe, it, expect, beforeEach } from "vitest";
import { GameRepository } from "@/server/repositories/gameRepository";
import { hashPassword } from "@/lib/auth/password";

describe("Game Engine Integration - Auth, Quests, Ledger, Shop, and Inventory", () => {
  let repo: GameRepository;
  let testUserId: string;

  beforeEach(async () => {
    repo = new GameRepository();
    const pw = await hashPassword("StrongPassword123!");
    const created = await repo.createUser({
      email: `hero_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@liferpg.io`,
      passwordHash: pw,
      displayName: "Valerius the Brave",
      characterName: "Valerius",
      timezone: "UTC",
    });
    testUserId = created.user.id;
  });

  it("provisions new character with starter attributes, gold, and starter quests", async () => {
    const charData = await repo.getCharacter(testUserId);
    expect(charData).not.toBeNull();
    expect(charData!.character.level).toBe(1);
    expect(charData!.character.totalXp).toBe(0);
    expect(charData!.character.gold).toBe(150);
    expect(charData!.attributes.length).toBe(6);

    const quests = await repo.getQuests(testUserId);
    expect(quests.length).toBeGreaterThanOrEqual(4);
  });

  it("completes quest atomically and calculates XP, Gold, and Streak authoritatively", async () => {
    const quests = await repo.getQuests(testUserId);
    const targetQuest = quests.find((q) => q.difficulty === "MEDIUM") || quests[0];

    const initialChar = (await repo.getCharacter(testUserId))!.character;
    const initialGold = initialChar.gold;
    const initialXp = initialChar.totalXp;

    const result = await repo.completeQuestAtomic({
      userId: testUserId,
      questId: targetQuest.id,
      idempotencyKey: `idemp_${Date.now()}`,
    });

    expect(result.success).toBe(true);
    expect(result.xpEarned).toBe(50); // MEDIUM quest
    expect(result.goldEarned).toBe(35);

    // Verify character state updated with quest rewards and unlocked FIRST_QUEST achievement
    const updatedChar = (await repo.getCharacter(testUserId))!.character;
    expect(result.unlockedAchievements.map((a) => a.code)).toContain("FIRST_QUEST");
    expect(updatedChar.totalXp).toBe(initialXp + 50 + 50); // 50 quest + 50 achievement
    expect(updatedChar.gold).toBe(initialGold + 35 + 25); // 35 quest + 25 achievement

    // Verify streak incremented to 1
    const streak = await repo.getStreak(testUserId);
    expect(streak.currentStreak).toBe(1);
  });

  it("prevents double-completion and double-reward exploit on one-time quests", async () => {
    // Create a one-time quest
    const quest = await repo.createQuest(testUserId, {
      title: "Clean Desk",
      difficulty: "EASY",
      attributeType: "DISCIPLINE",
      repeatType: "NONE",
    });

    // First completion succeeds
    const firstResult = await repo.completeQuestAtomic({
      userId: testUserId,
      questId: quest.id,
    });
    expect(firstResult.success).toBe(true);

    // Second completion attempt must fail
    await expect(
      repo.completeQuestAtomic({
        userId: testUserId,
        questId: quest.id,
      })
    ).rejects.toThrow("already been completed");
  });

  it("handles shop purchases atomically: validates price, deducts gold, and adds to inventory", async () => {
    const catalog = await repo.getShopCatalog();
    const cheapItem = catalog.find((i) => i.id === "frame_iron")!; // costs 50 gold

    const charBefore = (await repo.getCharacter(testUserId))!.character;
    expect(charBefore.gold).toBeGreaterThanOrEqual(cheapItem.price);

    const purchaseResult = await repo.purchaseShopItemAtomic(testUserId, cheapItem.id);
    expect(purchaseResult.success).toBe(true);
    expect(purchaseResult.remainingGold).toBe(charBefore.gold - cheapItem.price);

    // Check inventory
    const inventory = await repo.getUserInventory(testUserId);
    const owned = inventory.find((i) => i.itemId === cheapItem.id);
    expect(owned).toBeDefined();
    expect(owned!.isEquipped).toBe(false);

    // Prevent duplicate purchase of unique item
    await expect(repo.purchaseShopItemAtomic(testUserId, cheapItem.id)).rejects.toThrow(
      "already possess this unique item"
    );
  });

  it("rejects purchase when user has insufficient gold", async () => {
    const catalog = await repo.getShopCatalog();
    const expensiveItem = catalog.find((i) => i.id === "title_sovereign")!; // costs 750 gold

    await expect(repo.purchaseShopItemAtomic(testUserId, expensiveItem.id)).rejects.toThrow(
      "Insufficient gold"
    );
  });

  it("equips and unequips inventory items cleanly", async () => {
    const catalog = await repo.getShopCatalog();
    const item = catalog.find((i) => i.id === "frame_iron")!;
    await repo.purchaseShopItemAtomic(testUserId, item.id);

    const inv = await repo.getUserInventory(testUserId);
    const itemInInv = inv.find((i) => i.itemId === item.id)!;

    // Equip
    const equipped = await repo.equipInventoryItem(testUserId, itemInInv.id, true);
    expect(equipped.isEquipped).toBe(true);

    const char = (await repo.getCharacter(testUserId))!.character;
    expect(char.equippedFrameId).toBe(item.itemValue);

    // Unequip
    const unequipped = await repo.equipInventoryItem(testUserId, itemInInv.id, false);
    expect(unequipped.isEquipped).toBe(false);
  });

  it("triggers level-up when XP reaches threshold", async () => {
    // Complete 3 hard quests: 100 XP each -> 300 XP (level 2 requires 100, level 3 requires 283)
    const q1 = await repo.createQuest(testUserId, {
      title: "Hard Milestone 1",
      difficulty: "HARD",
      attributeType: "INTELLECT",
      repeatType: "DAILY",
    });
    const q2 = await repo.createQuest(testUserId, {
      title: "Hard Milestone 2",
      difficulty: "HARD",
      attributeType: "INTELLECT",
      repeatType: "DAILY",
    });
    const q3 = await repo.createQuest(testUserId, {
      title: "Hard Milestone 3",
      difficulty: "HARD",
      attributeType: "INTELLECT",
      repeatType: "DAILY",
    });

    await repo.completeQuestAtomic({ userId: testUserId, questId: q1.id });
    await repo.completeQuestAtomic({ userId: testUserId, questId: q2.id });
    const res3 = await repo.completeQuestAtomic({ userId: testUserId, questId: q3.id });

    expect(res3.newCharacter.totalXp).toBeGreaterThanOrEqual(300);
    expect(res3.newLevel).toBeGreaterThanOrEqual(3);
  });
});
