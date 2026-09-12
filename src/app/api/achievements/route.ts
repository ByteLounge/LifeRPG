import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const data = await gameRepository.getUserAchievements(session.userId);

    const unlockedMap = new Map(data.unlocked.map((u) => [u.achievement.code, u.unlockedAt]));

    const achievements = data.allAchievements.map((a) => ({
      ...a,
      isUnlocked: unlockedMap.has(a.code),
      unlockedAt: unlockedMap.get(a.code) || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        totalUnlocked: data.unlocked.length,
        totalAvailable: data.allAchievements.length,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}
