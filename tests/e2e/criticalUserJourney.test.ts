import { describe, it, expect } from "vitest";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { GET as questsHandler, POST as createQuestHandler } from "@/app/api/quests/route";
import { POST as completeQuestHandler } from "@/app/api/quests/[id]/complete/route";
import { GET as shopHandler } from "@/app/api/shop/route";
import { POST as purchaseHandler } from "@/app/api/shop/purchase/route";
import { GET as inventoryHandler } from "@/app/api/inventory/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

describe("E2E Critical User Journey: Signup -> Quest Creation -> Completion -> Level Up -> Rehydration -> Shop Purchase", () => {
  const testEmail = `hero_e2e_${Date.now()}@liferpg.io`;
  const testPassword = "HeroicPassword2026!";
  let sessionCookie: string = "";

  it("Step 1: Sign up new user and verify initial RPG state", async () => {
    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        displayName: "Sir Galahad",
        characterName: "Galahad the Unbroken",
        timezone: "UTC",
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.character.level).toBe(1);
    expect(json.data.character.totalXp).toBe(0);
    expect(json.data.character.gold).toBe(150);

    // Capture session cookie
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain(SESSION_COOKIE_NAME);
    sessionCookie = setCookie!.split(";")[0];
  });

  it("Step 2: Create a new custom Epic Quest", async () => {
    const req = new Request("http://localhost:3000/api/quests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        title: "Conquer Advanced Algorithmic Proofs",
        description: "Solve and prove 3 complex graph theory algorithms",
        category: "Knowledge & Study",
        difficulty: "EPIC",
        attributeType: "INTELLECT",
        estimatedMinutes: 60,
        repeatType: "DAILY",
      }),
    });

    const res = await createQuestHandler(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("Conquer Advanced Algorithmic Proofs");
    expect(json.data.difficulty).toBe("EPIC");

    // Fetch quests and verify it appears in user's journal
    const getReq = new Request("http://localhost:3000/api/quests", {
      headers: { Cookie: sessionCookie },
    });
    const getRes = await questsHandler(getReq);
    const getJson = await getRes.json();
    expect(getJson.data.some((q: { title: string }) => q.title === "Conquer Advanced Algorithmic Proofs")).toBe(true);
  });

  it("Step 3: Complete Epic Quest, trigger Level-Up and Achievement bonuses", async () => {
    // Find the epic quest
    const getReq = new Request("http://localhost:3000/api/quests", {
      headers: { Cookie: sessionCookie },
    });
    const getRes = await questsHandler(getReq);
    const quests = (await getRes.json()).data;
    const epicQuest = quests.find((q: { difficulty: string }) => q.difficulty === "EPIC");

    const completeReq = new Request(`http://localhost:3000/api/quests/${epicQuest.id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ idempotencyKey: `e2e_idemp_${Date.now()}` }),
    });

    const completeRes = await completeQuestHandler(completeReq, {
      params: Promise.resolve({ id: epicQuest.id }),
    });
    expect(completeRes.status).toBe(200);

    const compJson = await completeRes.json();
    expect(compJson.success).toBe(true);
    expect(compJson.data.xpEarned).toBe(250); // EPIC quest reward
    expect(compJson.data.goldEarned).toBe(200);

    // Level 2 requires 100 XP. 250 + 50 (FIRST_QUEST achievement) = 300 XP >= Level 3 (283 XP)!
    expect(compJson.data.leveledUp).toBe(true);
    expect(compJson.data.newLevel).toBeGreaterThanOrEqual(2);
    expect(compJson.data.newStreak.currentStreak).toBe(1);
  });

  it("Step 4: Simulate Page Refresh and verify all state persists from DB", async () => {
    const meReq = new Request("http://localhost:3000/api/auth/me", {
      headers: { Cookie: sessionCookie },
    });
    const meRes = await meHandler(meReq);
    expect(meRes.status).toBe(200);

    const meJson = await meRes.json();
    expect(meJson.success).toBe(true);
    // XP and Gold persisted across server rehydration
    expect(meJson.data.character.totalXp).toBeGreaterThanOrEqual(300);
    expect(meJson.data.character.level).toBeGreaterThanOrEqual(2);
    expect(meJson.data.character.gold).toBeGreaterThanOrEqual(350); // 150 starter + 200 quest + 25 ach
    expect(meJson.data.streak.currentStreak).toBe(1);
  });

  it("Step 5: Purchase a cosmetic item from the Bazaar shop", async () => {
    const shopReq = new Request("http://localhost:3000/api/shop", {
      headers: { Cookie: sessionCookie },
    });
    const shopRes = await shopHandler(shopReq);
    const shopJson = await shopRes.json();
    const itemToBuy = shopJson.data.items.find((i: { id: string }) => i.id === "frame_iron"); // 50 gold

    const purchaseReq = new Request("http://localhost:3000/api/shop/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ itemId: itemToBuy.id }),
    });

    const purchaseRes = await purchaseHandler(purchaseReq);
    expect(purchaseRes.status).toBe(200);
    const purchaseJson = await purchaseRes.json();
    expect(purchaseJson.success).toBe(true);

    // Verify inventory now includes the owned item
    const invReq = new Request("http://localhost:3000/api/inventory", {
      headers: { Cookie: sessionCookie },
    });
    const invRes = await inventoryHandler(invReq);
    const invJson = await invRes.json();
    const owned = invJson.data.inventory.find((i: { itemId: string }) => i.itemId === "frame_iron");
    expect(owned).toBeDefined();
  });

  it("Step 6: Login afresh with email/password and verify persisted state", async () => {
    const loginReq = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginRes = await loginHandler(loginReq);
    expect(loginRes.status).toBe(200);
    const loginJson = await loginRes.json();
    expect(loginJson.success).toBe(true);
    expect(loginJson.data.character.level).toBeGreaterThanOrEqual(2);
  });
});
