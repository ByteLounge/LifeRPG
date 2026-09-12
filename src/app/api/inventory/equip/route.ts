import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";
import { z } from "zod";

const EquipSchema = z.object({
  userInventoryId: z.string().min(1),
  isEquipped: z.boolean(),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const validated = EquipSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload." } },
        { status: 400 }
      );
    }

    const updated = await gameRepository.equipInventoryItem(
      session.userId,
      validated.data.userInventoryId,
      validated.data.isEquipped
    );

    const charData = await gameRepository.getCharacter(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        item: updated,
        character: charData?.character || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle equipment.";
    return NextResponse.json(
      { success: false, error: { code: "EQUIP_FAILED", message } },
      { status: 400 }
    );
  }
}
