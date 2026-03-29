import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/pa/callback",
  "/api/webhooks",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api (except public auth routes) and /dashboard
  const isApiRoute = pathname.startsWith("/api");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isApiRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (isApiRoute && isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    if (isDashboardRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json(
      {
        success: false,
        error: "Token d'accès manquant",
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    // Forward user info in headers for downstream routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId as string);
    response.headers.set("x-user-email", payload.email as string);
    response.headers.set("x-user-role", payload.role as string);
    if (payload.tenantId) {
      response.headers.set("x-tenant-id", payload.tenantId as string);
    }

    return response;
  } catch {
    if (isDashboardRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json(
      {
        success: false,
        error: "Token d'accès invalide ou expiré",
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
