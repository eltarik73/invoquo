import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") || "current_month";

    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date = now;
    let previousFrom: Date;
    let previousTo: Date;

    switch (period) {
      case "current_month":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousTo = dateFrom;
        break;
      case "last_month":
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        dateTo = new Date(now.getFullYear(), now.getMonth(), 1);
        previousFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousTo = dateFrom;
        break;
      case "current_quarter": {
        const qStart = Math.floor(now.getMonth() / 3) * 3;
        dateFrom = new Date(now.getFullYear(), qStart, 1);
        previousFrom = new Date(now.getFullYear(), qStart - 3, 1);
        previousTo = dateFrom;
        break;
      }
      case "current_year":
        dateFrom = new Date(now.getFullYear(), 0, 1);
        previousFrom = new Date(now.getFullYear() - 1, 0, 1);
        previousTo = dateFrom;
        break;
      default: // last_12_months
        dateFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        previousFrom = new Date(now.getFullYear() - 2, now.getMonth(), 1);
        previousTo = dateFrom;
    }

    // Current period invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        date: { gte: dateFrom, lt: dateTo },
      },
      select: {
        totalHT: true,
        totalTTC: true,
        totalVAT: true,
        status: true,
        date: true,
        clientId: true,
        client: { select: { companyName: true, firstName: true, lastName: true } },
      },
    });

    // Previous period for comparison
    const previousInvoices = await prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        date: { gte: previousFrom, lt: previousTo },
      },
      select: { totalHT: true, totalTTC: true },
    });

    const totalHT = invoices.reduce((s, i) => s + Number(i.totalHT), 0);
    const totalTTC = invoices.reduce((s, i) => s + Number(i.totalTTC), 0);
    const previousTotalHT = previousInvoices.reduce((s, i) => s + Number(i.totalHT), 0);

    const paidAmount = invoices
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + Number(i.totalTTC), 0);
    const overdueInvoices = invoices.filter((i) => i.status === "overdue");
    const overdueAmount = overdueInvoices.reduce((s, i) => s + Number(i.totalTTC), 0);

    // Status breakdown
    const statusMap = new Map<string, number>();
    for (const inv of invoices) {
      statusMap.set(inv.status, (statusMap.get(inv.status) || 0) + 1);
    }
    const statuses = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Monthly revenue (last 6 months)
    const revenue: Array<{ month: string; totalHT: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const month = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, "0")}`;
      const mInvoices = invoices.filter((inv) => {
        const d = new Date(inv.date);
        return d >= mDate && d < mEnd;
      });
      revenue.push({
        month,
        totalHT: mInvoices.reduce((s, i) => s + Number(i.totalHT), 0),
      });
    }

    // Top 5 clients
    const clientMap = new Map<string, { name: string; totalHT: number; count: number }>();
    for (const inv of invoices) {
      const name = inv.client.companyName ||
        [inv.client.firstName, inv.client.lastName].filter(Boolean).join(" ") || "Inconnu";
      const entry = clientMap.get(inv.clientId) || { name, totalHT: 0, count: 0 };
      entry.totalHT += Number(inv.totalHT);
      entry.count++;
      clientMap.set(inv.clientId, entry);
    }
    const topClients = Array.from(clientMap.entries())
      .map(([clientId, data]) => ({ clientId, clientName: data.name, totalHT: data.totalHT, count: data.count }))
      .sort((a, b) => b.totalHT - a.totalHT)
      .slice(0, 5);

    // VAT breakdown
    const lines = await prisma.invoiceLine.findMany({
      where: {
        invoice: {
          tenantId: ctx.tenantId,
          date: { gte: dateFrom, lt: dateTo },
        },
      },
      select: { vatRate: true, totalHT: true, totalVAT: true },
    });

    const vatMap = new Map<number, { totalHT: number; totalVAT: number }>();
    for (const line of lines) {
      const rate = Number(line.vatRate);
      const entry = vatMap.get(rate) || { totalHT: 0, totalVAT: 0 };
      entry.totalHT += Number(line.totalHT);
      entry.totalVAT += Number(line.totalVAT);
      vatMap.set(rate, entry);
    }
    const vatBreakdown = Array.from(vatMap.entries())
      .map(([rate, data]) => ({ rate, ...data }))
      .sort((a, b) => b.rate - a.rate);

    return apiSuccess({
      totalHT,
      totalTTC,
      invoiceCount: invoices.length,
      previousTotalHT,
      previousInvoiceCount: previousInvoices.length,
      paidAmount,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      revenue,
      statuses,
      topClients,
      vatBreakdown,
    });
  } catch (error) {
    console.error("Reporting error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
