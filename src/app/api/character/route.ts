import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";
import { getXPProgress } from "@/lib/game-engine/progression";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const charData = await gameRepository.getCharacter(session.userId);
    const streak = await gameRepository.getStreak(session.userId);
    const profile = await gameRepository.getProfile(session.userId);

    if (!charData) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Character not found." } },
        { status: 404 }
      );
    }

    const xpProgress = getXPProgress(charData.character.totalXp);

    return NextResponse.json({
      success: true,
      data: {
        character: charData.character,
        attributes: charData.attributes,
        streak,
        profile,
        xpProgress,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}
