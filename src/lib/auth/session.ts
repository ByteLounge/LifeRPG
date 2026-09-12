import { cookies } from "next/headers";
import { verifySessionToken, TokenPayload } from "./jwt";
import { gameRepository } from "@/server/repositories/gameRepository";

export const SESSION_COOKIE_NAME = "life_rpg_session";

export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<TokenPayload> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function getAuthenticatedUserData() {
  const session = await getSessionUser();
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
