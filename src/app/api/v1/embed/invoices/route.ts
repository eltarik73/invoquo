import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { verifyEmbedToken } from "@/lib/embed-auth";
import { createInvoiceSchema } from "@/modules/invoicing/schemas/invoice";
import { calculateInvoiceTotals, calculateLine } from "@/modules/invoicing/lib/calculations";
import { generateDocumentNumber } from "@/modules/invoicing/lib/numbering";

export async function POST(request: NextRequest) {
  try {
    const embedToken = request.headers.get("x-embed-token");
    if (!embedToken) return apiError("Token manquant", 401);

    const payload = await verifyEmbedToken(embedToken);
    if (!payload) return apiError("Token invalide ou expiré", 401);

    const tenantId = payload.sub;

    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const input = parsed.data;

    // Verify client belongs to tenant
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
    });
    if (!client || client.tenantId !== tenantId) {
      return apiError("Client introuvable", 404);
    }

    // Calculate totals
    const discount = input.discount
      ? { amount: input.discount.amount, type: input.discount.type }
      : undefined;
    const totals = calculateInvoiceTotals(input.lines, discount);

    // Create invoice in transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const docType = input.type === "credit_note" ? "credit_note" as const : "invoice" as const;
      const invoiceNumber = await generateDocumentNumber(tx, tenantId, docType);

      return tx.invoice.create({
        data: {
          tenantId,
          clientId: input.clientId,
          invoiceNumber,
          status: input.finalize ? "pending" : "draft",
          type: input.type,
          date: input.date,
          dueDate: input.dueDate,
          paymentTerms: input.paymentTerms,
          operationCategory: input.operationCategory,
          totalHT: totals.totalHT,
          totalVAT: totals.totalVAT,
          totalTTC: totals.totalTTC,
          discount: input.discount?.amount ?? null,
          discountType: input.discount?.type ?? null,
          notes: input.notes,
          lines: {
            create: input.lines.map((line, index) => {
              const calc = calculateLine(line);
              return {
                position: index + 1,
                description: line.description,
                quantity: line.quantity,
                unitPriceHT: line.unitPriceHT,
                vatRate: line.vatRate,
                totalHT: calc.totalHT,
                totalVAT: calc.totalVAT,
                totalTTC: calc.totalTTC,
                unit: line.unit,
              };
            }),
          },
        },
        include: { lines: true },
      });
    });

    return apiSuccess({ invoice }, 201);
  } catch (error) {
    console.error("Embed invoice create error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
