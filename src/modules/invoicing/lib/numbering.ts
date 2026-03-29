import { prisma } from "@/lib/prisma";

type DocumentType = "invoice" | "quote" | "credit_note";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Generate the next sequential document number for a tenant.
 *
 * Uses pg_advisory_xact_lock to prevent concurrent numbering gaps.
 * The lock is scoped per tenant (hash of tenantId) and released
 * automatically when the transaction commits.
 *
 * Format: {prefix}{year}-{number padded to 3 digits}
 * Example: F-2026-001, D-2026-012, AV-2026-003
 *
 * MUST be called inside a Prisma interactive transaction.
 */
export async function generateDocumentNumber(
  tx: TxClient,
  tenantId: string,
  type: DocumentType,
): Promise<string> {
  // Advisory lock based on tenantId hash to prevent concurrent gaps
  const lockKey = hashStringToInt(tenantId + type);
  await tx.$queryRawUnsafe(
    `SELECT pg_advisory_xact_lock(${lockKey})`,
  );

  const tenant = await tx.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      invoicePrefix: true,
      quotePrefix: true,
      creditNotePrefix: true,
      nextInvoiceNum: true,
      nextQuoteNum: true,
      nextCreditNum: true,
    },
  });

  let prefix: string;
  let currentNum: number;
  let updateData: Record<string, number>;

  switch (type) {
    case "invoice":
      prefix = tenant.invoicePrefix;
      currentNum = tenant.nextInvoiceNum;
      updateData = { nextInvoiceNum: currentNum + 1 };
      break;
    case "quote":
      prefix = tenant.quotePrefix;
      currentNum = tenant.nextQuoteNum;
      updateData = { nextQuoteNum: currentNum + 1 };
      break;
    case "credit_note":
      prefix = tenant.creditNotePrefix;
      currentNum = tenant.nextCreditNum;
      updateData = { nextCreditNum: currentNum + 1 };
      break;
  }

  const year = new Date().getFullYear();
  const paddedNum = String(currentNum).padStart(3, "0");

  // Increment counter atomically
  await tx.tenant.update({
    where: { id: tenantId },
    data: updateData,
  });

  return `${prefix}${year}-${paddedNum}`;
}

/**
 * Hash a string to a stable 32-bit integer for pg_advisory_lock.
 */
function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}
