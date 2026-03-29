import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const { id } = await params;

    const invoice = await prisma.receivedInvoice.findUnique({
      where: { id },
    });

    if (!invoice || invoice.tenantId !== ctx.tenantId) {
      return apiError("Facture reçue introuvable", 404);
    }

    return apiSuccess({ invoice });
  } catch (error) {
    console.error("Received invoice detail error:", error);
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

    const invoice = await prisma.receivedInvoice.findUnique({
      where: { id },
    });

    if (!invoice || invoice.tenantId !== ctx.tenantId) {
      return apiError("Facture reçue introuvable", 404);
    }

    const body = await request.json();
    const { status, notes } = body;

    if (status && !["pending", "validated", "rejected"].includes(status)) {
      return apiError("Statut invalide", 422);
    }

    const updated = await prisma.receivedInvoice.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return apiSuccess({ invoice: updated });
  } catch (error) {
    console.error("Received invoice update error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
