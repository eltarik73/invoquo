import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { verifyEmbedToken } from "@/lib/embed-auth";
import { createClientSchema } from "@/modules/clients/schemas/client";

export async function POST(request: NextRequest) {
  try {
    const embedToken = request.headers.get("x-embed-token");
    if (!embedToken) return apiError("Token manquant", 401);

    const payload = await verifyEmbedToken(embedToken);
    if (!payload) return apiError("Token invalide ou expiré", 401);

    const tenantId = payload.sub;

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const input = parsed.data;
    const siren = input.siren || (input.siret ? input.siret.slice(0, 9) : undefined);

    // Check for duplicate SIRET within tenant
    if (input.siret) {
      const existing = await prisma.client.findUnique({
        where: { tenantId_siret: { tenantId, siret: input.siret } },
      });
      if (existing) {
        return apiError("Un client avec ce SIRET existe déjà", 409);
      }
    }

    const client = await prisma.client.create({
      data: {
        tenantId,
        type: input.type,
        companyName: input.companyName,
        firstName: input.firstName,
        lastName: input.lastName,
        siret: input.siret || null,
        siren: siren || null,
        vatNumber: input.vatNumber,
        email: input.email || null,
        phone: input.phone,
        address: input.address,
        postalCode: input.postalCode,
        city: input.city,
        country: input.country,
        deliveryAddress: input.deliveryAddress,
        deliveryPostalCode: input.deliveryPostalCode,
        deliveryCity: input.deliveryCity,
        source: input.source,
        notes: input.notes,
      },
    });

    return apiSuccess({ client }, 201);
  } catch (error) {
    console.error("Embed client create error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
