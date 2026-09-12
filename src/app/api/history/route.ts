import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { gameRepository } from "@/server/repositories/gameRepository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const ledger = await gameRepository.getActivityLedger(session.userId, limit);

    return NextResponse.json({
      success: true,
      data: ledger,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401 }
    );
  }
}
