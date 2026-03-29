import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTenantId } from "@/lib/auth-helpers";
import { getDefaultAdapter } from "@/modules/pa/lib/adapter";

const PA_REDIRECT_URI = process.env.PA_REDIRECT_URI!;

export async function POST(request: NextRequest) {
  try {
    const ctx = getTenantId(request);
    if (ctx.error) return ctx.error;

    // Generate a CSRF state token containing tenantId
    const statePayload = JSON.stringify({
      tenantId: ctx.tenantId,
      nonce: crypto.randomBytes(16).toString("hex"),
    });
    const state = Buffer.from(statePayload).toString("base64url");

    const adapter = getDefaultAdapter();
    const authUrl = adapter.getAuthUrl(PA_REDIRECT_URI, state);

    // Mark tenant as pending connection
    await prisma.tenant.update({
      where: { id: ctx.tenantId },
      data: {
        paProvider: "pennylane",
        paStatus: "disconnected",
      },
    });

    return apiSuccess({ authUrl });
  } catch (error) {
    console.error("PA connect error:", error);
    return apiError("Erreur interne du serveur", 500);
  }
}
