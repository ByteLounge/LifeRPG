import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { CreateQuestSchema } from "@/lib/validation/quest";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    const quests = await gameRepository.getQuests(session.userId, { status, category, difficulty });

    return NextResponse.json({
      success: true,
      data: quests,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to view quests." } },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const validated = CreateQuestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid quest parameters.",
          },
        },
        { status: 400 }
      );
    }

    const { title, description, category, difficulty, attributeType, estimatedMinutes, repeatType, dueDate } =
      validated.data;

    const quest = await gameRepository.createQuest(session.userId, {
      title,
      description,
      category,
      difficulty,
      attributeType,
      estimatedMinutes,
      repeatType,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return NextResponse.json(
      {
        success: true,
        data: quest,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized quest creation." } },
      { status: 401 }
    );
  }
}
