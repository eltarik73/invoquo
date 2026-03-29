import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "@/modules/auth/lib/tokens";
import {
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/modules/auth/lib/cookies";

export async function POST() {
  try {
    const token = await getRefreshTokenCookie();
    if (!token) {
      return apiError("Refresh token manquant", 401);
    }

    const tokenHash = hashToken(token);

    // Find and validate the refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      return apiError("Refresh token invalide", 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return apiError("Refresh token expiré", 401);
    }

    const { user } = storedToken;
    const newRefresh = generateRefreshToken();

    // Rotate: delete old token and create new one atomically
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: {
          tokenHash: newRefresh.hash,
          userId: user.id,
          expiresAt: newRefresh.expiresAt,
        },
      }),
    ]);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    await setRefreshTokenCookie(newRefresh.token);

    return apiSuccess({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
