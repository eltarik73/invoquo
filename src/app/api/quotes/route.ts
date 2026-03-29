import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import {
  createQuoteSchema,
  quoteListQuerySchema,
} from "@/modules/invoicing/schemas/quote";
import { calculateInvoiceTotals, calculateLine } from "@/modules/invoicing/lib/calculations";
import { generateDocumentNumber } from "@/modules/invoicing/lib/numbering";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = quoteListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { page, limit, status, clientId, sort, order, search } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: ctx.tenantId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
        { client: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return apiSuccess({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Quote list error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

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
    if (!client || client.tenantId !== ctx.tenantId) {
      return apiError("Client introuvable", 404);
    }

    const totals = calculateInvoiceTotals(input.lines);

    const quote = await prisma.$transaction(async (tx) => {
      const quoteNumber = await generateDocumentNumber(
        tx,
        ctx.tenantId,
        "quote",
      );

      return tx.quote.create({
        data: {
          tenantId: ctx.tenantId,
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
    console.error("Quote create error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
