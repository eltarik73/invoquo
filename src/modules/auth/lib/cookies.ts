import { cookies } from "next/headers";

const REFRESH_TOKEN_COOKIE = "invoquo_refresh_token";
const REFRESH_TOKEN_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function clearRefreshTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}
