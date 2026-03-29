import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { updateInvoiceSchema } from "@/modules/invoicing/schemas/invoice";
import { calculateInvoiceTotals, calculateLine } from "@/modules/invoicing/lib/calculations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { position: "asc" } },
        client: true,
      },
    });

    if (!invoice || invoice.tenantId !== ctx.tenantId) {
      return apiError("Facture introuvable", 404);
    }

    return apiSuccess({ invoice });
  } catch (error) {
    console.error("Invoice detail error:", error);
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

    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice || invoice.tenantId !== ctx.tenantId) {
      return apiError("Facture introuvable", 404);
    }

    // Only drafts can be modified
    if (invoice.status !== "draft") {
      return apiError(
        "Seuls les brouillons peuvent être modifiés. Créez un avoir pour corriger une facture finalisée.",
        403,
      );
    }

    const body = await request.json();
    const parsed = updateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const input = parsed.data;

    // If changing client, verify ownership
    if (input.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: input.clientId },
      });
      if (!client || client.tenantId !== ctx.tenantId) {
        return apiError("Client introuvable", 404);
      }
    }

    // Recalculate totals if lines changed
    let totalsUpdate = {};
    if (input.lines) {
      const discount = input.discount
        ? { amount: input.discount.amount, type: input.discount.type }
        : undefined;
      const totals = calculateInvoiceTotals(input.lines, discount);
      totalsUpdate = {
        totalHT: totals.totalHT,
        totalVAT: totals.totalVAT,
        totalTTC: totals.totalTTC,
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old lines if new lines provided
      if (input.lines) {
        await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
      }

      return tx.invoice.update({
        where: { id },
        data: {
          ...(input.clientId ? { clientId: input.clientId } : {}),
          ...(input.date ? { date: input.date } : {}),
          ...(input.dueDate ? { dueDate: input.dueDate } : {}),
          ...(input.paymentTerms ? { paymentTerms: input.paymentTerms } : {}),
          ...(input.operationCategory
            ? { operationCategory: input.operationCategory }
            : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.discount !== undefined
            ? {
                discount: input.discount?.amount ?? null,
                discountType: input.discount?.type ?? null,
              }
            : {}),
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

    return apiSuccess({ invoice: updated });
  } catch (error) {
    console.error("Invoice update error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice || invoice.tenantId !== ctx.tenantId) {
      return apiError("Facture introuvable", 404);
    }

    // Only drafts can be deleted
    if (invoice.status !== "draft") {
      return apiError(
        "Seuls les brouillons peuvent être supprimés. Créez un avoir pour annuler une facture finalisée.",
        403,
      );
    }

    await prisma.invoice.delete({ where: { id } });

    return apiSuccess({ message: "Brouillon supprimé" });
  } catch (error) {
    console.error("Invoice delete error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
