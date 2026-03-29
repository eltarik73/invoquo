import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
    });

    if (!tenant) return apiError("Entreprise introuvable", 404);

    // Strip sensitive PA tokens from response
    const {
      paAccessToken: _a,
      paRefreshToken: _r,
      ...settings
    } = tenant;

    return apiSuccess(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    const body = await request.json();

    // Whitelist allowed fields to prevent overwriting sensitive data
    const ALLOWED_FIELDS = [
      "companyName", "legalForm", "capital", "address", "postalCode", "city",
      "vatNumber", "apeCode", "insuranceNumber", "insuranceProvider",
      "insuranceCoverage", "rcs", "phone", "email", "website",
      "templateId", "accentColor", "logoUrl",
      "headerLine1", "headerLine2", "footerLine1", "footerLine2", "footerLine3",
      "invoicePrefix", "quotePrefix", "creditNotePrefix",
      "iban", "bic", "bankName", "bankAccountHolder", "showBankOnInvoice",
      "defaultPaymentTerms", "defaultLatePenaltyRate", "defaultEarlyPaymentDiscount",
      "emailSubjectTemplate", "emailBodyTemplate",
      "reminderSubjectTemplate", "reminderBodyTemplate",
      "autoReminder", "reminderDays",
      "cgvText", "attachCgv", "vatOnDebits", "isMemberAssociation", "isVatExempt",
    ];

    const data: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    const updated = await prisma.tenant.update({
      where: { id: ctx.tenantId },
      data,
    });

    const {
      paAccessToken: _a,
      paRefreshToken: _r,
      ...settings
    } = updated;

    return apiSuccess(settings);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
