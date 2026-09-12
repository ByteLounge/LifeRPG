import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const inventory = await gameRepository.getUserInventory(session.userId);
    const charData = await gameRepository.getCharacter(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        inventory,
        character: charData?.character || null,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}
