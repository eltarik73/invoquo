import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { verifyEmbedToken } from "@/lib/embed-auth";
import { createQuoteSchema } from "@/modules/invoicing/schemas/quote";
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
    const parsed = createQuoteSchema.safeParse(body);

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

    const totals = calculateInvoiceTotals(input.lines);

    const quote = await prisma.$transaction(async (tx) => {
      const quoteNumber = await generateDocumentNumber(tx, tenantId, "quote");

      return tx.quote.create({
        data: {
          tenantId,
          clientId: input.clientId,
          quoteNumber,
          date: input.date,
          validUntil: input.validUntil,
          operationCategory: input.operationCategory,
          totalHT: totals.totalHT,
          totalVAT: totals.totalVAT,
          totalTTC: totals.totalTTC,
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

    return apiSuccess({ quote }, 201);
  } catch (error) {
    console.error("Embed quote create error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
