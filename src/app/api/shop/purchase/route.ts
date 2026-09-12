import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";
import { z } from "zod";

const PurchaseSchema = z.object({
  itemId: z.string().min(1, "Item ID is required."),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const validated = PurchaseSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid purchase request." } },
        { status: 400 }
      );
    }

    const result = await gameRepository.purchaseShopItemAtomic(session.userId, validated.data.itemId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Purchase failed.";
    return NextResponse.json(
      { success: false, error: { code: "PURCHASE_FAILED", message } },
      { status: 400 }
    );
  }
}
