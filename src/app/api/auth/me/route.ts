import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return apiError("Non autorise", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
  if (!user) return apiError("Utilisateur non trouve", 404);

  const tenant = session.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        select: {
          id: true,
          siret: true,
          siren: true,
          companyName: true,
          address: true,
          city: true,
          postalCode: true,
        },
      })
    : null;

  return apiSuccess({ ...user, tenant });
}
