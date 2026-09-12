import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const profile = await gameRepository.getProfile(session.userId);
    const charData = await gameRepository.getCharacter(session.userId);
    const streak = await gameRepository.getStreak(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        user: session,
        profile,
        character: charData?.character || null,
        attributes: charData?.attributes || [],
        streak,
      },
    });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch user state." } },
      { status: 500 }
    );
  }
}
