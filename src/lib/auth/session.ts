import { cookies } from "next/headers";
import { verifySessionToken, TokenPayload } from "./jwt";
import { gameRepository } from "@/server/repositories/gameRepository";

export const SESSION_COOKIE_NAME = "life_rpg_session";

export async function getSessionUser(req?: Request): Promise<TokenPayload | null> {
  try {
    let token: string | undefined;

    // Check request cookies or authorization headers if request is passed
    if (req) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) {
        token = match[1];
      }
      if (!token) {
        const authHeader = req.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    }

    // Fall back to Next.js cookies() API
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      } catch {
        // Not in Next.js HTTP server context
      }
    }

    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(req?: Request): Promise<TokenPayload> {
  const user = await getSessionUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function getAuthenticatedUserData(req?: Request) {
  const session = await getSessionUser(req);
  if (!session) return null;

  const profile = await gameRepository.getProfile(session.userId);
  const characterData = await gameRepository.getCharacter(session.userId);
  const streak = await gameRepository.getStreak(session.userId);

  return {
    user: session,
    profile,
    character: characterData?.character || null,
    attributes: characterData?.attributes || [],
    streak,
  };
}
