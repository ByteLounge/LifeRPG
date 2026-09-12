import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validation/auth";
import { gameRepository } from "@/server/repositories/gameRepository";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid login data.",
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const user = await gameRepository.findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password combination.",
          },
        },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password combination.",
          },
        },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    const profile = await gameRepository.getProfile(user.id);
    const charData = await gameRepository.getCharacter(user.id);

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email },
        profile,
        character: charData?.character || null,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to authenticate. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
