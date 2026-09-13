import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validation/auth";
import { gameRepository } from "@/server/repositories/gameRepository";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid registration data.",
          },
        },
        { status: 400 }
      );
    }

    const { email, password, displayName, characterName, timezone } = validated.data;

    const existingUser = await gameRepository.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email address already exists.",
          },
        },
        { status: 409 }
      );
    }

    // Register with Supabase Auth if Supabase keys are configured
    let supabaseUserId: string | undefined;
    const adminClient = getSupabaseAdminClient();
    const anonClient = getSupabaseClient();

    if (adminClient) {
      const { data: supaUser, error: supaError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { displayName, characterName },
      });
      if (supaError) {
        if (supaError.message.toLowerCase().includes("already registered") || supaError.status === 422) {
          return NextResponse.json(
            { success: false, error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email address already exists in Supabase." } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { success: false, error: { code: "SUPABASE_AUTH_ERROR", message: supaError.message } },
          { status: 400 }
        );
      }
      supabaseUserId = supaUser.user?.id;
    } else if (anonClient) {
      const { data: supaData, error: supaError } = await anonClient.auth.signUp({
        email,
        password,
        options: {
          data: { displayName, characterName },
        },
      });
      if (supaError) {
        if (supaError.message.toLowerCase().includes("already registered") || supaError.status === 422) {
          return NextResponse.json(
            { success: false, error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email address already exists in Supabase." } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { success: false, error: { code: "SUPABASE_AUTH_ERROR", message: supaError.message } },
          { status: 400 }
        );
      }
      supabaseUserId = supaData.user?.id;
    }

    const passwordHash = await hashPassword(password);
    const { user, profile, character } = await gameRepository.createUser({
      id: supabaseUserId,
      email,
      passwordHash,
      displayName,
      characterName,
      timezone: timezone || "UTC",
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email },
        profile,
        character,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to create your account. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
