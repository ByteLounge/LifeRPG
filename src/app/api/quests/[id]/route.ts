import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { UpdateQuestSchema } from "@/lib/validation/quest";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await requireAuth();
    const quest = await gameRepository.getQuestById(session.userId, params.id);

    if (!quest) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Quest not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: quest });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await requireAuth();
    const body = await req.json();

    const validated = UpdateQuestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid update data.",
          },
        },
        { status: 400 }
      );
    }

    const updated = await gameRepository.updateQuest(session.userId, params.id, {
      ...validated.data,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update quest.";
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await requireAuth();
    const deleted = await gameRepository.deleteQuest(session.userId, params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Quest not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}
