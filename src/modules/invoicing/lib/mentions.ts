interface TenantProfile {
  legalForm: string | null;
  isVatExempt: boolean;
  vatOnDebits: boolean;
  isMemberAssociation: boolean;
  insuranceNumber: string | null;
  insuranceProvider: string | null;
  insuranceCoverage: string | null;
  defaultLatePenaltyRate: string;
  defaultEarlyPaymentDiscount: string;
}

interface InvoiceContext {
  operationCategory: "goods" | "services" | "mixed";
  clientType: "company" | "individual";
  clientCountry: string;
}

interface LegalMention {
  text: string;
  mandatory: boolean;
  category: "payment" | "tax" | "insurance" | "membership" | "operation";
}

/**
 * Generate all applicable legal mentions for an invoice
 * based on the tenant profile and invoice context.
 */
export function generateMentions(
  tenant: TenantProfile,
  context: InvoiceContext,
): LegalMention[] {
  const mentions: LegalMention[] = [];

  // --- Payment mentions (always mandatory) ---

  // Late payment penalties
  const penaltyText = formatPenaltyRate(tenant.defaultLatePenaltyRate);
  mentions.push({
    text: `En cas de retard de paiement, des pénalités de ${penaltyText} seront appliquées.`,
    mandatory: true,
    category: "payment",
  });

  // Fixed recovery indemnity (40€)
  mentions.push({
    text: "Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €.",
    mandatory: true,
    category: "payment",
  });

  // Early payment discount
  mentions.push({
    text: `Escompte pour paiement anticipé : ${tenant.defaultEarlyPaymentDiscount}.`,
    mandatory: true,
    category: "payment",
  });

  // --- Tax mentions (conditional) ---

  // VAT exemption (art. 293 B)
  if (tenant.isVatExempt) {
    mentions.push({
      text: "TVA non applicable, art. 293 B du CGI.",
      mandatory: true,
      category: "tax",
    });
  }

  // VAT on debits option
  if (tenant.vatOnDebits && !tenant.isVatExempt) {
    mentions.push({
      text: "Option pour le paiement de la TVA d'après les débits.",
      mandatory: true,
      category: "tax",
    });
  }

  // Reverse charge for B2B intra-EU (not France)
  if (
    context.clientType === "company" &&
    context.clientCountry !== "FR" &&
    isEUCountry(context.clientCountry)
  ) {
    mentions.push({
      text: "Autoliquidation — TVA due par le preneur (art. 283-2 du CGI).",
      mandatory: true,
      category: "tax",
    });
  }

  // --- Operation category (mandatory since sept 2026) ---
  const categoryLabel = {
    goods: "Livraison de biens",
    services: "Prestation de services",
    mixed: "Mixte",
  }[context.operationCategory];

  mentions.push({
    text: `Catégorie d'opération : ${categoryLabel}.`,
    mandatory: true,
    category: "operation",
  });

  // --- EI mention ---
  if (tenant.legalForm === "EI") {
    mentions.push({
      text: "Entrepreneur individuel.",
      mandatory: true,
      category: "tax",
    });
  }

  // --- Insurance mention (artisans) ---
  if (tenant.insuranceNumber && tenant.insuranceProvider) {
    const coverage = tenant.insuranceCoverage
      ? ` Couverture géographique : ${tenant.insuranceCoverage}.`
      : "";
    mentions.push({
      text: `Assurance professionnelle : ${tenant.insuranceProvider}, contrat n° ${tenant.insuranceNumber}.${coverage}`,
      mandatory: true,
      category: "insurance",
    });
  }

  // --- Association membership ---
  if (tenant.isMemberAssociation) {
    mentions.push({
      text: "Membre d'une association agréée, le règlement par chèque et carte bancaire est accepté.",
      mandatory: false,
      category: "membership",
    });
  }

  return mentions;
}

function formatPenaltyRate(rate: string): string {
  switch (rate) {
    case "3x_legal_rate":
      return "3 fois le taux d'intérêt légal";
    case "10_percent":
      return "10 %";
    case "12_percent":
      return "12 %";
    case "15_percent":
      return "15 %";
    default:
      return rate;
  }
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

function isEUCountry(code: string): boolean {
  return EU_COUNTRIES.has(code.toUpperCase());
}
