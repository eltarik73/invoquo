import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { generateExportFiles } from "@/modules/isca/lib/export";
import { logJET } from "@/modules/isca/lib/jet";
import { getTenantSecretKey } from "@/modules/isca/lib/keys";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { searchParams } = request.nextUrl;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      return apiError("Les parametres dateFrom et dateTo sont requis", 422);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { siret: true },
    });
    if (!tenant) return apiError("Tenant introuvable", 404);

    const userId = request.headers.get("x-user-id") || "system";

    const files = await generateExportFiles({
      tenantId: ctx.tenantId,
      siret: tenant.siret,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
    });

    // Trace in JET
    const secretKey = await getTenantSecretKey(ctx.tenantId);
    await prisma.$transaction(async (tx) => {
      await logJET(tx, {
        tenantId: ctx.tenantId,
        siret: tenant.siret,
        userId,
        type: "EXPORT_FISCAL_GENERE",
        description: `Export fiscal genere — ${dateFrom} a ${dateTo}`,
        secretKey,
      });
    });

    // Build a simple combined response (archiver would be used for real ZIP)
    // For now return JSON with file contents — ZIP generation requires archiver
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    return new Response(
      JSON.stringify({
        success: true,
        data: { files: files.map((f) => ({ name: f.name, size: f.content.length })) },
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers },
    );
  } catch (error) {
    console.error("ISCA export error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
