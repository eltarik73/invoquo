import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { registerSchema } from "@/modules/auth/schemas/auth";
import { hashPassword } from "@/modules/auth/lib/passwords";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/modules/auth/lib/tokens";
import { setRefreshTokenCookie } from "@/modules/auth/lib/cookies";
import { fetchCompanyBySiret } from "@/modules/auth/lib/pappers";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { email, password, siret } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError("Un compte existe déjà avec cette adresse email", 409);
    }

    // Fetch company data from Pappers
    const company = await fetchCompanyBySiret(siret);
    if (!company) {
      return apiError("SIRET introuvable. Vérifiez le numéro saisi.", 422);
    }

    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { siret },
    });

    const passwordHash = await hashPassword(password);
    const refresh = generateRefreshToken();

    // Create user + tenant (or attach to existing tenant) in a transaction
    const user = await prisma.$transaction(async (tx: TransactionClient) => {
      let tenantId: string;

      if (existingTenant) {
        tenantId = existingTenant.id;
      } else {
        const tenant = await tx.tenant.create({
          data: {
            siret: company.siret,
            siren: company.siren,
            companyName: company.companyName,
            legalForm: company.legalForm,
            capital: company.capital,
            address: company.address,
            postalCode: company.postalCode,
            city: company.city,
            vatNumber: company.vatNumber,
            apeCode: company.apeCode,
            rcs: company.rcs,
          },
        });
        tenantId = tenant.id;
      }

      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          tenantId,
        },
      });

      await tx.refreshToken.create({
        data: {
          tokenHash: refresh.hash,
          userId: newUser.id,
          expiresAt: refresh.expiresAt,
        },
      });

      return newUser;
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    await setRefreshTokenCookie(refresh.token);

    return apiSuccess(
      {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
