import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "8 caracteres minimum"),
  siret: z.string().regex(/^\d{14}$/, "SIRET invalide (14 chiffres)"),
  companyName: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Email deja utilise", 409);

    const existingTenant = await prisma.tenant.findUnique({ where: { siret: data.siret } });
    if (existingTenant) return apiError("Ce SIRET est deja inscrit", 409);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pappersData: any = {};
    if (process.env.PAPPERS_API_KEY) {
      try {
        const res = await fetch(
          `https://api.pappers.fr/v2/entreprise?siret=${data.siret}&api_token=${process.env.PAPPERS_API_KEY}`,
        );
        if (res.ok) {
          const p = await res.json();
          pappersData = {
            siren: p.siren || data.siret.slice(0, 9),
            companyName: p.denomination || p.nom_entreprise || data.companyName || "",
            legalForm: p.forme_juridique || null,
            capital: p.capital ? `${p.capital} EUR` : null,
            address: p.siege?.adresse_ligne_1 || "",
            postalCode: p.siege?.code_postal || "",
            city: p.siege?.ville || "",
            vatNumber: p.numero_tva_intracommunautaire || null,
            apeCode: p.code_naf ? `${p.code_naf} — ${p.libelle_code_naf}` : null,
          };
        }
      } catch (e) {
        console.error("Pappers API error:", e);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          siret: data.siret,
          siren: pappersData.siren || data.siret.slice(0, 9),
          companyName: pappersData.companyName || data.companyName || data.email.split("@")[0],
          legalForm: pappersData.legalForm,
          capital: pappersData.capital,
          address: pappersData.address || "",
          postalCode: pappersData.postalCode || "",
          city: pappersData.city || "",
          vatNumber: pappersData.vatNumber,
          apeCode: pappersData.apeCode,
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: await hashPassword(data.password),
          role: "user",
          tenantId: tenant.id,
        },
      });

      return { user, tenant };
    });

    await setAuthCookie(result.user.id, result.user.role, result.tenant.id);

    return apiSuccess(
      {
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
        tenant: { id: result.tenant.id, siret: result.tenant.siret, companyName: result.tenant.companyName },
      },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error.issues[0].message, 422);
    }
    console.error("Register error:", error);
    return apiError("Erreur interne", 500);
  }
}
