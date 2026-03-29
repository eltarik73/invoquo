import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { verifyAccessToken } from "@/modules/auth/lib/tokens";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return apiError("Token d'accès manquant", 401);
    }

    const token = authHeader.slice(7);

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return apiError("Token d'accès invalide ou expiré", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        createdAt: true,
        tenant: {
          select: {
            siret: true,
            siren: true,
            companyName: true,
            legalForm: true,
            address: true,
            postalCode: true,
            city: true,
            paStatus: true,
          },
        },
      },
    });

    if (!user) {
      return apiError("Utilisateur introuvable", 404);
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error("Me error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
