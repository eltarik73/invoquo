import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/modules/pa/lib/adapter";
import { getValidPaToken } from "@/modules/pa/lib/token-manager";

/**
 * Synchronize received invoices from PA for a single tenant.
 * Called by the BullMQ polling job every 10 minutes.
 *
 * Flow:
 * 1. GET /changelogs/supplier_invoices?start_date={lastSync}
 * 2. Paginate with cursor (has_more + next_cursor)
 * 3. Batch fetch complete invoices (filter in)
 * 4. Upsert into ReceivedInvoice (paInvoiceId as unique key)
 * 5. Handle deletes
 * 6. Save lastSync (processed_at of the last changelog entry)
 */
export async function syncReceivedInvoices(tenantId: string): Promise<{
  upserted: number;
  deleted: number;
}> {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      paProvider: true,
      paLastSync: true,
      paStatus: true,
    },
  });

  if (!tenant.paProvider || tenant.paStatus !== "connected") {
    return { upserted: 0, deleted: 0 };
  }

  const accessToken = await getValidPaToken(tenantId);
  const adapter = getAdapter(tenant.paProvider);

  // Default to 30 days ago if never synced
  const since = tenant.paLastSync ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { invoices, deletedIds, lastProcessedAt } =
    await adapter.pollReceivedInvoices(accessToken, since);

  let upserted = 0;
  let deleted = 0;

  // Upsert received invoices
  for (const inv of invoices) {
    await prisma.receivedInvoice.upsert({
      where: {
        tenantId_paInvoiceId: {
          tenantId,
          paInvoiceId: inv.paInvoiceId,
        },
      },
      create: {
        tenantId,
        paInvoiceId: inv.paInvoiceId,
        supplierName: inv.supplierName,
        supplierSiret: inv.supplierSiret,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        totalHT: inv.totalHT,
        totalTTC: inv.totalTTC,
        currency: inv.currency,
        paStatus: inv.paStatus,
        pdfUrl: inv.pdfUrl,
        category: inv.category,
      },
      update: {
        supplierName: inv.supplierName,
        supplierSiret: inv.supplierSiret,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        totalHT: inv.totalHT,
        totalTTC: inv.totalTTC,
        currency: inv.currency,
        paStatus: inv.paStatus,
        pdfUrl: inv.pdfUrl,
        category: inv.category,
      },
    });
    upserted++;
  }

  // Handle deletes
  if (deletedIds.length > 0) {
    const result = await prisma.receivedInvoice.deleteMany({
      where: {
        tenantId,
        paInvoiceId: { in: deletedIds },
      },
    });
    deleted = result.count;
  }

  // Save lastSync
  if (lastProcessedAt) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { paLastSync: new Date(lastProcessedAt) },
    });
  }

  return { upserted, deleted };
}

/**
 * Sync all connected tenants. Used by the BullMQ scheduled job.
 */
export async function syncAllTenants(): Promise<void> {
  const connectedTenants = await prisma.tenant.findMany({
    where: { paStatus: "connected" },
    select: { id: true, companyName: true },
  });

  for (const tenant of connectedTenants) {
    try {
      await syncReceivedInvoices(tenant.id);
    } catch (error) {
      console.error(
        `Sync failed for tenant ${tenant.companyName} (${tenant.id}):`,
        error,
      );
    }
  }
}
