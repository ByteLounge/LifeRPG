import { describe, it, expect, beforeEach } from "vitest";
import { GameRepository } from "@/server/repositories/gameRepository";
import { hashPassword } from "@/lib/auth/password";
import { CreateQuestSchema } from "@/lib/validation/quest";
import { RegisterSchema } from "@/lib/validation/auth";

describe("Security & Edge Cases Audit Suite", () => {
  let repo: GameRepository;
  let userAliceId: string;
  let userBobId: string;

  beforeEach(async () => {
    repo = new GameRepository();
    const pw = await hashPassword("StrongSecurityTestPass1!");

    const alice = await repo.createUser({
      email: `alice_${Date.now()}_${Math.random()}@liferpg.io`,
      passwordHash: pw,
      displayName: "Alice the Defender",
    });
    userAliceId = alice.user.id;

    const bob = await repo.createUser({
      email: `bob_${Date.now()}_${Math.random()}@liferpg.io`,
      passwordHash: pw,
      displayName: "Bob the Rogue",
    });
    userBobId = bob.user.id;
  });

  describe("Tenant Isolation & IDOR Protection", () => {
    it("prevents User Bob from accessing or completing User Alice's quest", async () => {
      const aliceQuest = await repo.createQuest(userAliceId, {
        title: "Alice's Sacred Relic Quest",
        difficulty: "EPIC",
        attributeType: "INTELLECT",
        repeatType: "NONE",
      });

      // Bob tries to fetch Alice's quest
      const bobAttemptFetch = await repo.getQuestById(userBobId, aliceQuest.id);
      expect(bobAttemptFetch).toBeNull();

      // Bob tries to complete Alice's quest to steal 250 XP and 200 Gold
      await expect(
        repo.completeQuestAtomic({
          userId: userBobId,
          questId: aliceQuest.id,
        })
      ).rejects.toThrow("Quest not found or unauthorized");

      // Verify Bob did not get any XP or Gold
      const bobChar = (await repo.getCharacter(userBobId))!.character;
      expect(bobChar.totalXp).toBe(0);
      expect(bobChar.gold).toBe(150);
    });

    it("prevents User Bob from deleting User Alice's quest", async () => {
      const aliceQuest = await repo.createQuest(userAliceId, {
        title: "Alice's Daily Meditation",
        difficulty: "EASY",
        attributeType: "DISCIPLINE",
      });

      const deleteResult = await repo.deleteQuest(userBobId, aliceQuest.id);
      expect(deleteResult).toBe(false);

      // Verify Alice's quest still exists
      const stillThere = await repo.getQuestById(userAliceId, aliceQuest.id);
      expect(stillThere).not.toBeNull();
    });
  });

  describe("Anti-Cheating: Server Authoritative Progression", () => {
    it("disallows client from specifying custom reward amounts", async () => {
      // In Life RPG, completeQuestAtomic only accepts questId, deriving rewards strictly from quest.difficulty
      const epicQuest = await repo.createQuest(userAliceId, {
        title: "Master Calculus III",
        difficulty: "EPIC",
        attributeType: "INTELLECT",
        repeatType: "NONE",
      });

      const completion = await repo.completeQuestAtomic({
        userId: userAliceId,
        questId: epicQuest.id,
      });

      // Exactly 250 XP (EPIC) + 50 XP (FIRST_QUEST achievement)
      expect(completion.xpEarned).toBe(250);
      expect(completion.goldEarned).toBe(200);
    });
  });

  describe("Zod Input Validation Hardening", () => {
    it("rejects empty quest title", () => {
      const result = CreateQuestSchema.safeParse({
        title: "",
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
    });

    it("rejects excessively long quest title (> 120 chars)", () => {
      const result = CreateQuestSchema.safeParse({
        title: "A".repeat(150),
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid difficulty enumeration", () => {
      const result = CreateQuestSchema.safeParse({
        title: "Valid Title",
        difficulty: "SUPER_GOD_MODE",
      });
      expect(result.success).toBe(false);
    });

    it("rejects weak password on registration", () => {
      const result = RegisterSchema.safeParse({
        email: "adventurer@liferpg.io",
        password: "short",
        displayName: "Val",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Economy Protection & Negative Balance Prevention", () => {
    it("strictly forbids purchasing items when balance is insufficient", async () => {
      const catalog = await repo.getShopCatalog();
      const legendaryItem = catalog.find((i) => i.rarity === "LEGENDARY")!;

      await expect(
        repo.purchaseShopItemAtomic(userAliceId, legendaryItem.id)
      ).rejects.toThrow("Insufficient gold");

      const aliceChar = (await repo.getCharacter(userAliceId))!.character;
      expect(aliceChar.gold).toBeGreaterThanOrEqual(0);
    });

    it("prevents purchasing an already owned unique cosmetic", async () => {
      const catalog = await repo.getShopCatalog();
      const item = catalog.find((i) => i.id === "frame_iron")!; // costs 50

      await repo.purchaseShopItemAtomic(userAliceId, item.id);

      await expect(
        repo.purchaseShopItemAtomic(userAliceId, item.id)
      ).rejects.toThrow("already possess this unique item");
    });
  });
});
