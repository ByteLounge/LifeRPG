import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req);
    const catalog = await gameRepository.getShopCatalog();
    const userInventory = await gameRepository.getUserInventory(session.userId);
    const charData = await gameRepository.getCharacter(session.userId);

    const ownedItemIds = new Set(userInventory.map((i) => i.itemId));

    const catalogWithOwnership = catalog.map((item) => ({
      ...item,
      isOwned: ownedItemIds.has(item.id),
      canAfford: (charData?.character.gold || 0) >= item.price,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: catalogWithOwnership,
        userGold: charData?.character.gold || 0,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}
