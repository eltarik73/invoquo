import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import {
  createClientSchema,
  clientListQuerySchema,
} from "@/modules/clients/schemas/client";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = clientListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { page, limit, source, type, sort, order, search } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: ctx.tenantId };
    if (source) where.source = source;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { siret: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return apiSuccess({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Client list error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const input = parsed.data;

    // Derive SIREN from SIRET if not provided
    const siren = input.siren || (input.siret ? input.siret.slice(0, 9) : undefined);

    // Check for duplicate SIRET within tenant
    if (input.siret) {
      const existing = await prisma.client.findUnique({
        where: {
          tenantId_siret: {
            tenantId: ctx.tenantId,
            siret: input.siret,
          },
        },
      });
      if (existing) {
        return apiError("Un client avec ce SIRET existe déjà", 409);
      }
    }

    const client = await prisma.client.create({
      data: {
        tenantId: ctx.tenantId,
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
    console.error("Client create error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
