import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { updateClientSchema } from "@/modules/clients/schemas/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalTTC: true,
            date: true,
          },
          orderBy: { date: "desc" },
          take: 10,
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            totalTTC: true,
            date: true,
          },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!client || client.tenantId !== ctx.tenantId) {
      return apiError("Client introuvable", 404);
    }

    return apiSuccess({ client });
  } catch (error) {
    console.error("Client detail error:", error);
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

    const client = await prisma.client.findUnique({ where: { id } });

    if (!client || client.tenantId !== ctx.tenantId) {
      return apiError("Client introuvable", 404);
    }

    const body = await request.json();
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const input = parsed.data;

    // Derive SIREN from SIRET if SIRET changed
    const updateData: Record<string, unknown> = { ...input };
    if (input.siret && input.siret.length === 14) {
      updateData.siren = input.siret.slice(0, 9);
    }

    // Clean empty strings to null
    if (updateData.siret === "") updateData.siret = null;
    if (updateData.email === "") updateData.email = null;

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess({ client: updated });
  } catch (error) {
    console.error("Client update error:", error);
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

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client || client.tenantId !== ctx.tenantId) {
      return apiError("Client introuvable", 404);
    }

    // Check if client has invoices or quotes
    const [invoiceCount, quoteCount] = await Promise.all([
      prisma.invoice.count({ where: { clientId: id } }),
      prisma.quote.count({ where: { clientId: id } }),
    ]);

    if (invoiceCount > 0 || quoteCount > 0) {
      return apiError(
        `Ce client a ${invoiceCount} facture(s) et ${quoteCount} devis. Il ne peut pas etre supprime.`,
        409,
      );
    }

    await prisma.client.delete({ where: { id } });
    return apiSuccess({ message: "Client supprime" });
  } catch (error) {
    console.error("Client delete error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
