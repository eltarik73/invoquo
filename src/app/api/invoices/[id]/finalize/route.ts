import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lines: true, client: true },
    });

    if (!invoice || invoice.tenantId !== ctx.tenantId) {
      return apiError("Facture introuvable", 404);
    }

    if (invoice.status !== "draft") {
      return apiError("Seuls les brouillons peuvent être finalisés", 403);
    }

    // Validate completeness before finalization
    if (invoice.lines.length === 0) {
      return apiError("La facture doit contenir au moins une ligne", 422);
    }

    if (!invoice.operationCategory) {
      return apiError("La catégorie d'opération est obligatoire", 422);
    }

    // B2B France: client must have SIREN/SIRET
    if (
      invoice.client.type === "company" &&
      invoice.client.country === "FR" &&
      !invoice.client.siren &&
      !invoice.client.siret
    ) {
      return apiError(
        "Le SIREN/SIRET du client est obligatoire pour une facture B2B en France",
        422,
      );
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: "pending" },
      include: {
        lines: { orderBy: { position: "asc" } },
        client: true,
      },
    });

    return apiSuccess({ invoice: updated });
  } catch (error) {
    console.error("Invoice finalize error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
