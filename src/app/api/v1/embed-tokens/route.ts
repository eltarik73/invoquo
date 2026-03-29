import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

const EMBED_SECRET = new TextEncoder().encode(process.env.EMBED_JWT_SECRET!);

const ALL_MODULES = [
  "dashboard",
  "invoices",
  "received",
  "quotes",
  "clients",
  "reporting",
  "export",
  "compliance",
  "settings",
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return apiError("API key requise", 401);

    const tenant = await prisma.tenant.findUnique({ where: { apiKey } });
    if (!tenant) return apiError("API key invalide", 401);

    const body = await req.json();
    const { siret, modules } = body;

    if (siret && siret !== tenant.siret) {
      return apiError("SIRET non autorise pour cette API key", 403);
    }

    const token = await new SignJWT({
      sub: tenant.id,
      siret: tenant.siret,
      type: "embed",
      modules: modules || ALL_MODULES,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(EMBED_SECRET);

    return apiSuccess({ token, expiresIn: 3600 });
  } catch (error) {
    console.error("Embed token error:", error);
    return apiError("Erreur interne", 500);
  }
}
