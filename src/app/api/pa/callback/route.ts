import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultAdapter } from "@/modules/pa/lib/adapter";
import { enqueueSync } from "@/modules/received/lib/polling-job";

const PA_REDIRECT_URI = process.env.PA_REDIRECT_URI!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings?pa_error=${encodeURIComponent(errorParam)}`,
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings?pa_error=missing_params`,
      );
    }

    // Decode state to get tenantId
    let tenantId: string;
    try {
      const statePayload = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8"),
      );
      tenantId = statePayload.tenantId;
    } catch {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings?pa_error=invalid_state`,
      );
    }

    // Exchange code for tokens
    const adapter = getDefaultAdapter();
    const tokens = await adapter.exchangeCode(code, PA_REDIRECT_URI);

    // Store tokens and mark as connected
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        paAccessToken: tokens.accessToken,
        paRefreshToken: tokens.refreshToken,
        paTokenExpiresAt: tokens.expiresAt,
        paStatus: "connected",
      },
    });

    // Trigger initial sync
    try {
      await enqueueSync(tenantId);
    } catch {
      // Non-blocking: sync will happen on next scheduled poll
    }

    return NextResponse.redirect(
      `${APP_URL}/dashboard/settings?pa_connected=true`,
    );
  } catch (error) {
    console.error("PA callback error:", error);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/settings?pa_error=exchange_failed`,
    );
  }
}
