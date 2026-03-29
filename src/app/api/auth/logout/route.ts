import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { hashToken } from "@/modules/auth/lib/tokens";
import {
  getRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "@/modules/auth/lib/cookies";

export async function POST() {
  try {
    const token = await getRefreshTokenCookie();

    if (token) {
      const tokenHash = hashToken(token);
      await prisma.refreshToken
        .delete({ where: { tokenHash } })
        .catch(() => {});
    }

    await clearRefreshTokenCookie();

    return apiSuccess({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Logout error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
