import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { verifyTenant } from "@/modules/isca/lib/verify";
import { logJET } from "@/modules/isca/lib/jet";
import { getTenantSecretKey } from "@/modules/isca/lib/keys";

export async function POST(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { siret: true },
    });
    if (!tenant) return apiError("Tenant introuvable", 404);

    const userId = request.headers.get("x-user-id") || "system";

    // Log verification start
    const secretKey = await getTenantSecretKey(ctx.tenantId);
    await prisma.$transaction(async (tx) => {
      await logJET(tx, {
        tenantId: ctx.tenantId,
        siret: tenant.siret,
        userId,
        type: "VERIFICATION_HMAC_LANCEE",
        description: "Verification d'integrite HMAC lancee",
        secretKey,
      });
    });

    // Run verification
    const results = await verifyTenant(ctx.tenantId, tenant.siret);

    const totalValid = results.reduce((s, r) => s + r.valid, 0);
    const totalInvalid = results.reduce((s, r) => s + r.invalid, 0);
    const allValid = totalInvalid === 0;

    // Log result
    await prisma.$transaction(async (tx) => {
      await logJET(tx, {
        tenantId: ctx.tenantId,
        siret: tenant.siret,
        userId,
        type: "VERIFICATION_HMAC_RESULTAT",
        description: allValid
          ? `Verification reussie — ${totalValid} signatures valides`
          : `Verification echouee — ${totalInvalid} signature(s) invalide(s) sur ${totalValid + totalInvalid}`,
        details: {
          results: results.map((r) => ({
            table: r.table,
            total: r.total,
            valid: r.valid,
            invalid: r.invalid,
          })),
        },
        secretKey,
      });
    });

    return apiSuccess({
      valid: allValid,
      totalRecords: totalValid + totalInvalid,
      totalValid,
      totalInvalid,
      tables: results.map((r) => ({
        table: r.table,
        total: r.total,
        valid: r.valid,
        invalid: r.invalid,
        errors: r.errors.slice(0, 10), // limit errors in response
      })),
    });
  } catch (error) {
    console.error("ISCA verify error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
