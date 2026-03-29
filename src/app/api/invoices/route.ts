import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import {
  createInvoiceSchema,
  invoiceListQuerySchema,
} from "@/modules/invoicing/schemas/invoice";
import { calculateInvoiceTotals, calculateLine } from "@/modules/invoicing/lib/calculations";
import { generateDocumentNumber } from "@/modules/invoicing/lib/numbering";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = invoiceListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { page, limit, status, clientId, type, from, to, sort, order, search } =
      parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: ctx.tenantId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (type) where.type = type;
    if (from || to) {
      where.date = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
        { client: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
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
      prisma.invoice.count({ where }),
    ]);

    return apiSuccess({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Invoice list error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

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
    if (!client || client.tenantId !== ctx.tenantId) {
      return apiError("Client introuvable", 404);
    }

    // Validate: B2B France requires SIREN on client
    if (
      client.type === "company" &&
      client.country === "FR" &&
      !client.siren &&
      !client.siret
    ) {
      return apiError(
        "Le SIREN/SIRET du client est obligatoire pour une facture B2B en France",
        422,
      );
    }

    // Calculate totals
    const discount = input.discount
      ? { amount: input.discount.amount, type: input.discount.type }
      : undefined;
    const totals = calculateInvoiceTotals(input.lines, discount);

    // Create invoice in transaction (for atomic numbering)
    const invoice = await prisma.$transaction(async (tx) => {
      const docType = input.type === "credit_note" ? "credit_note" as const : "invoice" as const;
      const invoiceNumber = await generateDocumentNumber(
        tx,
        ctx.tenantId,
        docType,
      );

      const created = await tx.invoice.create({
        data: {
          tenantId: ctx.tenantId,
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

      return created;
    });

    return apiSuccess({ invoice }, 201);
  } catch (error) {
    console.error("Invoice create error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
