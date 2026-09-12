import { SignJWT, jwtVerify } from "jose";
import { TextEncoder } from "node:util";

const encoder = new TextEncoder();
const JWT_SECRET_STRING = process.env.JWT_SECRET || "liferpg_development_secret_key_minimum_32_chars_123456789";
const JWT_SECRET = encoder.encode(JWT_SECRET_STRING);

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  const encodedPayload = encoder.encode(JSON.stringify({ ...payload }));
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || !payload.email) return null;
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
