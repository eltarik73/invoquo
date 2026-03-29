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

    const original = await prisma.invoice.findUnique({
      where: { id },
      include: { lines: { orderBy: { position: "asc" } } },
    });

    if (!original || original.tenantId !== ctx.tenantId) {
      return apiError("Facture introuvable", 404);
    }

    const duplicate = await prisma.$transaction(async (tx) => {
      const docType = original.type === "credit_note" ? "credit_note" as const : "invoice" as const;
      const invoiceNumber = await generateDocumentNumber(
        tx,
        ctx.tenantId,
        docType,
      );

      return tx.invoice.create({
        data: {
          tenantId: ctx.tenantId,
          clientId: original.clientId,
          invoiceNumber,
          status: "draft",
          type: original.type,
          date: new Date(),
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ),
          paymentTerms: original.paymentTerms,
          operationCategory: original.operationCategory,
          totalHT: original.totalHT,
          totalVAT: original.totalVAT,
          totalTTC: original.totalTTC,
          discount: original.discount,
          discountType: original.discountType,
          notes: original.notes,
          lines: {
            create: original.lines.map((line) => ({
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
    });

    return apiSuccess({ invoice: duplicate }, 201);
  } catch (error) {
    console.error("Invoice duplicate error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
