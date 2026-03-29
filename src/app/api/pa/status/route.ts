import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: {
        paProvider: true,
        paStatus: true,
        paLastSync: true,
        paCompanyId: true,
      },
    });

    if (!tenant) {
      return apiError("Entreprise introuvable", 404);
    }

    return apiSuccess({
      connected: tenant.paStatus === "connected",
      status: tenant.paStatus,
      lastSync: tenant.paLastSync,
      hasProvider: !!tenant.paProvider,
    });
  } catch (error) {
    console.error("PA status error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
