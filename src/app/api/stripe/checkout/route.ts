import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { STRIPE_PRICES, type PlanId } from "@/lib/stripe-config";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return apiError("Non autorisé", 401);

    const { plan, coupon } = await req.json();
    if (!plan || !(plan in STRIPE_PRICES)) return apiError("Plan invalide", 422);

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { id: true, siret: true, email: true, companyName: true, stripeCustomerId: true, stripeSubId: true },
    });
    if (!tenant) return apiError("Tenant introuvable", 404);

    // Create Stripe customer if needed
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.email || undefined,
        name: tenant.companyName,
        metadata: { tenantId: tenant.id, siret: tenant.siret },
      });
      customerId = customer.id;
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = STRIPE_PRICES[plan as PlanId].monthly;
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://invoquo.vercel.app";

    // Check if first subscription (trial)
    const hadSubscription = !!tenant.stripeSubId;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard/settings?tab=plan`,
      allow_promotion_codes: !coupon,
      metadata: { tenantId: tenant.id, plan },
    };

    if (!hadSubscription) {
      sessionParams.subscription_data = { trial_period_days: 30 };
    }

    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    return apiSuccess({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return apiError("Erreur lors de la création du checkout", 500);
  }
}
