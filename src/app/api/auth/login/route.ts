import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: email?.toLowerCase()?.trim() },
      include: {
        tenant: { select: { id: true, siret: true, companyName: true } },
      },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return apiError("Email ou mot de passe incorrect", 401);
    }

    await setAuthCookie(user.id, user.role, user.tenantId || undefined);

    return apiSuccess({
      user: { id: user.id, email: user.email, role: user.role },
      tenant: user.tenant,
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Erreur interne", 500);
  }
}
