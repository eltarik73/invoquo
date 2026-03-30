import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session?.tenantId) return apiError("Non autorise", 401);

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { apiKey: true, apiKeyCreatedAt: true },
  });

  if (!tenant?.apiKey) return apiSuccess({ apiKey: null });

  const masked =
    "\u2022".repeat(tenant.apiKey.length - 8) + tenant.apiKey.slice(-8);

  return apiSuccess({
    apiKey: masked,
    createdAt: tenant.apiKeyCreatedAt,
  });
}

export async function POST() {
  const session = await getSession();
  if (!session?.tenantId) return apiError("Non autorise", 401);

  const newKey = `inv_${randomUUID().replace(/-/g, "")}`;

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { apiKey: newKey, apiKeyCreatedAt: new Date() },
  });

  return apiSuccess({ apiKey: newKey, message: "Nouvelle API key generee" });
}
