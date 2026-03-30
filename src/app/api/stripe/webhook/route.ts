/**
 * Webhook Stripe — POST /api/stripe/webhook
 *
 * Cette route est appelée par Stripe, PAS par un utilisateur.
 * Elle est exclue du middleware JWT (PUBLIC_ROUTES).
 *
 * Configuration du webhook dans Stripe Dashboard :
 *   URL : https://invoquo.vercel.app/api/stripe/webhook
 *   Événements :
 *     - checkout.session.completed
 *     - customer.subscription.updated
 *     - customer.subscription.deleted
 *     - invoice.payment_failed
 *   Copier le whsec_... dans Vercel env var STRIPE_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { PRICE_TO_PLAN } from "@/lib/stripe-config";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan;

        if (tenantId && plan) {
          const subId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
              stripeSubId: subId || undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

        const tenant = await prisma.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (tenant && plan) {
          const updates: Record<string, unknown> = {
            plan,
            stripeSubId: sub.id,
          };

          // Trial ended, now active
          if (sub.status === "active" && tenant.trialEndsAt) {
            updates.trialEndsAt = null;
          }

          await prisma.tenant.update({
            where: { id: tenant.id },
            data: updates,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await prisma.tenant.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "essentiel",
            stripeSubId: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(
          `Payment failed for customer ${typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id}`,
        );
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
