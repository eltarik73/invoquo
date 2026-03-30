import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "invoquo-session";

const PUBLIC_ROUTES = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/pa/callback",
  "/api/webhooks",
  "/api/lookup",
  "/api/stripe/webhook",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Embed routes — auth by embedToken in query param, not cookie
  if (pathname.startsWith("/embed/")) return NextResponse.next();

  // External API routes — auth by apiKey header, not cookie
  if (pathname.startsWith("/api/v1/")) return NextResponse.next();

  const isProtectedAPI =
    pathname.startsWith("/api/") &&
    !PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedPage = pathname.startsWith("/dashboard");

  if (isProtectedAPI || isProtectedPage) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Non autorise" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      const res = NextResponse.next();
      res.headers.set("x-user-id", payload.sub as string);
      res.headers.set("x-user-role", payload.role as string);
      if (payload.tenantId)
        res.headers.set("x-tenant-id", payload.tenantId as string);
      return res;
    } catch {
      const res = pathname.startsWith("/api/")
        ? NextResponse.json(
            { success: false, error: "Session expiree" },
            { status: 401 },
          )
        : NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
  }

  // Redirect if already logged in on login/signup
  if (pathname === "/login" || pathname === "/signup") {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {
        // invalid token, let through
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/login", "/signup"],
};
