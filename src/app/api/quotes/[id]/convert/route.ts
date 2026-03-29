import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { generateDocumentNumber } from "@/modules/invoicing/lib/numbering";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { lines: { orderBy: { position: "asc" } }, client: true },
    });

    if (!quote || quote.tenantId !== ctx.tenantId) {
      return apiError("Devis introuvable", 404);
    }

    if (quote.convertedToInvoiceId) {
      return apiError("Ce devis a déjà été converti en facture", 409);
    }

    // B2B France: client must have SIREN/SIRET
    if (
      quote.client.type === "company" &&
      quote.client.country === "FR" &&
      !quote.client.siren &&
      !quote.client.siret
    ) {
      return apiError(
        "Le SIREN/SIRET du client est obligatoire pour une facture B2B en France",
        422,
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateDocumentNumber(
        tx,
        ctx.tenantId,
        "invoice",
      );

      const created = await tx.invoice.create({
        data: {
          tenantId: ctx.tenantId,
          clientId: quote.clientId,
          invoiceNumber,
          status: "draft",
          type: "invoice",
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentTerms: "30_days",
          operationCategory: quote.operationCategory,
          totalHT: quote.totalHT,
          totalVAT: quote.totalVAT,
          totalTTC: quote.totalTTC,
          fromQuoteId: quote.id,
          linkedQuoteId: quote.id,
          notes: quote.notes,
          lines: {
            create: quote.lines.map((line) => ({
              position: line.position,
              description: line.description,
              quantity: line.quantity,
              unitPriceHT: line.unitPriceHT,
              vatRate: line.vatRate,
              totalHT: line.totalHT,
              totalVAT: line.totalVAT,
              totalTTC: line.totalTTC,
              unit: line.unit,
            })),
          },
        },
        include: { lines: true },
      });

      // Mark quote as converted
      await tx.quote.update({
        where: { id },
        data: {
          convertedToInvoiceId: created.id,
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      return created;
    });

    return apiSuccess({ invoice }, 201);
  } catch (error) {
    console.error("Quote convert error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
