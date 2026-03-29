import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { receivedInvoicesQuerySchema } from "@/modules/received/schemas/received-invoices";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = receivedInvoicesQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { page, limit, status, sort, order, search } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { tenantId: ctx.tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { supplierName: { contains: search, mode: "insensitive" } },
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { supplierSiret: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.receivedInvoice.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.receivedInvoice.count({ where }),
    ]);

    return apiSuccess({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Received invoices list error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
