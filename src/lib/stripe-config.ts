export const STRIPE_PRICES = {
  essentiel: {
    monthly: "price_1TGgJkEobVVEeCFTWAlOjUok",
    productId: "prod_UFAfuGB8tTrKWW",
    price: 19,
    label: "Essentiel",
    desc: "Réception de factures via PA",
  },
  standard: {
    monthly: "price_1TGgKVEobVVEeCFT0DL4WOyc",
    productId: "prod_UFAfenRPQYLtxS",
    price: 29,
    label: "Standard",
    desc: "Réception + émission via PA",
  },
  pro: {
    monthly: "price_1TGgLFEobVVEeCFTUINqixQC",
    productId: "prod_UFAgFru8wtf21A",
    price: 39,
    label: "Pro",
    desc: "Tout inclus + création factures/devis",
  },
} as const;

export type PlanId = keyof typeof STRIPE_PRICES;

export const PRICE_TO_PLAN: Record<string, PlanId> = {
  "price_1TGgJkEobVVEeCFTWAlOjUok": "essentiel",
  "price_1TGgKVEobVVEeCFT0DL4WOyc": "standard",
  "price_1TGgLFEobVVEeCFTUINqixQC": "pro",
};

export const PRODUCT_TO_PLAN: Record<string, PlanId> = {
  "prod_UFAfuGB8tTrKWW": "essentiel",
  "prod_UFAfenRPQYLtxS": "standard",
  "prod_UFAgFru8wtf21A": "pro",
};

export const STRIPE_COUPONS = {
  FREE_FIRST_MONTH: "JL0YHOnM",
  HALF_PRICE_1_YEAR: "FWFUGXFF",
  MINUS_30_EUR_1_YEAR: "UrMclOxW",
} as const;

export const PLAN_ORDER: PlanId[] = ["essentiel", "standard", "pro"];

export function getEffectivePlan(
  plan: string,
  trialEndsAt: Date | null,
): PlanId {
  if (trialEndsAt && new Date(trialEndsAt) > new Date()) return "pro";
  if (plan in STRIPE_PRICES) return plan as PlanId;
  return "essentiel";
}
