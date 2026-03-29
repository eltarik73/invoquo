import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { updateQuoteSchema } from "@/modules/invoicing/schemas/quote";
import { calculateInvoiceTotals, calculateLine } from "@/modules/invoicing/lib/calculations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { position: "asc" } },
        client: true,
      },
    });

    if (!quote || quote.tenantId !== ctx.tenantId) {
      return apiError("Devis introuvable", 404);
    }

    return apiSuccess({ quote });
  } catch (error) {
    console.error("Quote detail error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote || quote.tenantId !== ctx.tenantId) {
      return apiError("Devis introuvable", 404);
    }

    if (quote.status !== "draft") {
      return apiError("Seuls les brouillons de devis peuvent être modifiés", 403);
    }

    const body = await request.json();
    const parsed = updateQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const input = parsed.data;

    if (input.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: input.clientId },
      });
      if (!client || client.tenantId !== ctx.tenantId) {
        return apiError("Client introuvable", 404);
      }
    }

    let totalsUpdate = {};
    if (input.lines) {
      const totals = calculateInvoiceTotals(input.lines);
      totalsUpdate = {
        totalHT: totals.totalHT,
        totalVAT: totals.totalVAT,
        totalTTC: totals.totalTTC,
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (input.lines) {
        await tx.quoteLine.deleteMany({ where: { quoteId: id } });
      }

      return tx.quote.update({
        where: { id },
        data: {
          ...(input.clientId ? { clientId: input.clientId } : {}),
          ...(input.date ? { date: input.date } : {}),
          ...(input.validUntil ? { validUntil: input.validUntil } : {}),
          ...(input.operationCategory
            ? { operationCategory: input.operationCategory }
            : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...totalsUpdate,
          ...(input.lines
            ? {
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
              }
            : {}),
        },
        include: { lines: { orderBy: { position: "asc" } } },
      });
    });

    return apiSuccess({ quote: updated });
  } catch (error) {
    console.error("Quote update error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
