import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import bcrypt from "bcryptjs";

const PROVISION_SECRET = process.env.PROVISION_SECRET;

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-provision-secret");
    if (!secret || secret !== PROVISION_SECRET) {
      return apiError("Non autorise", 401);
    }

    const body = await req.json();
    const { email, siret, companyName, firstName, lastName, address, postalCode, city, phone } = body;

    if (!email || !siret) {
      return apiError("Email et SIRET requis", 422);
    }

    // Check if tenant already exists by SIRET
    const existingTenant = await prisma.tenant.findUnique({ where: { siret } });
    if (existingTenant) {
      return apiSuccess({
        tenantId: existingTenant.id,
        apiKey: existingTenant.apiKey,
        siret: existingTenant.siret,
        alreadyExists: true,
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser?.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: existingUser.tenantId },
      });
      if (tenant) {
        return apiSuccess({
          tenantId: tenant.id,
          apiKey: tenant.apiKey,
          siret: tenant.siret,
          alreadyExists: true,
        });
      }
    }
    if (existingUser) {
      return apiError("Email deja utilise sans tenant associe", 409);
    }

    const apiKey = `inv_${randomUUID().replace(/-/g, "")}`;
    const tempPassword = `inv_${randomUUID().slice(0, 12)}`;

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          siret,
          siren: siret.slice(0, 9),
          companyName: companyName || email.split("@")[0],
          address: address || "",
          postalCode: postalCode || "",
          city: city || "",
          country: "FR",
          phone: phone || null,
          email: email.toLowerCase().trim(),
          apiKey,
          apiKeyCreatedAt: new Date(),
          paStatus: "disconnected",
        },
      });

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(tempPassword, 12),
          role: "user",
          firstName: firstName || null,
          lastName: lastName || null,
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    return apiSuccess(
      {
        tenantId: result.tenant.id,
        userId: result.user.id,
        apiKey,
        siret,
        tempPassword,
        alreadyExists: false,
      },
      201,
    );
  } catch (error) {
    console.error("Provision error:", error);
    return apiError("Erreur interne", 500);
  }
}
