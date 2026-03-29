import { prisma } from "@/lib/prisma";
import { getAdapter } from "./adapter";

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

/**
 * Get a valid PA access token for a tenant.
 * Automatically refreshes if expired or about to expire.
 */
export async function getValidPaToken(tenantId: string): Promise<string> {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      paProvider: true,
      paAccessToken: true,
      paRefreshToken: true,
      paTokenExpiresAt: true,
      paStatus: true,
    },
  });

  if (!tenant.paProvider || !tenant.paAccessToken || !tenant.paRefreshToken) {
    throw new Error("Aucune Plateforme Agréée connectée");
  }

  if (tenant.paStatus === "error") {
    throw new Error("La connexion à la Plateforme Agréée est en erreur");
  }

  // Token still valid
  const now = new Date();
  if (
    tenant.paTokenExpiresAt &&
    tenant.paTokenExpiresAt.getTime() - TOKEN_REFRESH_MARGIN_MS > now.getTime()
  ) {
    return tenant.paAccessToken;
  }

  // Token expired or about to — refresh it
  const adapter = getAdapter(tenant.paProvider);
  try {
    const tokens = await adapter.refreshToken(tenant.paRefreshToken);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        paAccessToken: tokens.accessToken,
        paRefreshToken: tokens.refreshToken,
        paTokenExpiresAt: tokens.expiresAt,
        paStatus: "connected",
      },
    });

    return tokens.accessToken;
  } catch (error) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { paStatus: "error" },
    });
    throw new Error(
      `Impossible de rafraîchir le token PA: ${error instanceof Error ? error.message : "erreur inconnue"}`,
    );
  }
}
