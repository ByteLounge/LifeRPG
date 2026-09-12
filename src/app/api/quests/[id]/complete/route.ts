import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await requireAuth();
    let idempotencyKey: string | undefined;

    try {
      const body = await req.json();
      idempotencyKey = body?.idempotencyKey;
    } catch {
      // Body is optional
    }

    const result = await gameRepository.completeQuestAtomic({
      userId: session.userId,
      questId: params.id,
      idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete quest.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "COMPLETION_ERROR",
          message,
        },
      },
      { status: 400 }
    );
  }
}
