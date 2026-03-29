import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  generateAttestationData,
  generateLicenseNumber,
} from "@/modules/isca/lib/attestation";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { siret: true, companyName: true },
    });
    if (!tenant) return apiError("Tenant introuvable", 404);

    const attestation = generateAttestationData({
      tenantSiret: tenant.siret,
      tenantCompanyName: tenant.companyName,
      editorName: "Representant legal Invoquo",
      editorCompany: "Invoquo SAS",
      softwareVersion: "1.0.0",
      releaseDate: "2026-09-01",
    });

    return apiSuccess({
      attestation,
      licenseNumber: generateLicenseNumber(tenant.siret),
      warning:
        "ATTENTION : cette attestation ne doit etre delivree qu'apres validation par un avocat fiscaliste. Art. 441-1 Code penal : 3 ans + 45 000 EUR si fausse attestation.",
    });
  } catch (error) {
    console.error("ISCA attestation error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
