import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return apiError("Non autorisé", 401);

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant?.stripeCustomerId) {
      return apiError("Aucun abonnement actif", 400);
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://invoquo.vercel.app";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${origin}/dashboard/settings?tab=plan`,
    });

    return apiSuccess({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return apiError("Erreur lors de l'ouverture du portail", 500);
  }
}
