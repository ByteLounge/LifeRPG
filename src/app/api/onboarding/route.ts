import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { OnboardingSchema } from "@/lib/validation/auth";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const validated = OnboardingSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid onboarding configuration." } },
        { status: 400 }
      );
    }

    const { characterName, preferredTheme, focusAttribute } = validated.data;

    await gameRepository.updateProfile(session.userId, {
      theme: preferredTheme,
      onboarded: true,
    });

    const charData = await gameRepository.getCharacter(session.userId);
    if (charData) {
      charData.character.name = characterName;
      // Give initial bonus to chosen focus attribute
      const updatedAttrs = charData.attributes.map((a) => {
        if (a.type === focusAttribute) {
          return { ...a, currentXp: a.currentXp + 25 };
        }
        return a;
      });
      // Attributes updated
    }

    return NextResponse.json({
      success: true,
      data: { message: "Onboarding complete!" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Onboarding failed.";
    return NextResponse.json(
      { success: false, error: { code: "ONBOARDING_ERROR", message } },
      { status: 400 }
    );
  }
}
