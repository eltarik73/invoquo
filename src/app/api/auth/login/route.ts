import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { loginSchema } from "@/modules/auth/schemas/auth";
import { verifyPassword } from "@/modules/auth/lib/passwords";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/modules/auth/lib/tokens";
import { setRefreshTokenCookie } from "@/modules/auth/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError("Email ou mot de passe incorrect", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiError("Email ou mot de passe incorrect", 401);
    }

    const refresh = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        tokenHash: refresh.hash,
        userId: user.id,
        expiresAt: refresh.expiresAt,
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    await setRefreshTokenCookie(refresh.token);

    return apiSuccess({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
