import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return apiError("API key requise", 401);

    const tenant = await prisma.tenant.findUnique({ where: { apiKey } });
    if (!tenant) return apiError("API key invalide", 401);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pendingReceivedInvoices, overdueInvoices, monthlyInvoices] =
      await Promise.all([
        prisma.receivedInvoice.count({
          where: { tenantId: tenant.id, status: "pending" },
        }),
        prisma.invoice.count({
          where: { tenantId: tenant.id, status: "overdue" },
        }),
        prisma.invoice.count({
          where: {
            tenantId: tenant.id,
            createdAt: { gte: startOfMonth },
            status: { not: "draft" },
          },
        }),
      ]);

    return apiSuccess({
      pendingReceivedInvoices,
      overdueInvoices,
      monthlyInvoices,
      paStatus: tenant.paStatus,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return apiError("Erreur interne", 500);
  }
}
