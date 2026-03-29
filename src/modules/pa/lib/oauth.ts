import type { OAuthTokens } from "../types";

const PA_CLIENT_ID = process.env.PA_CLIENT_ID!;
const PA_CLIENT_SECRET = process.env.PA_CLIENT_SECRET!;
const PA_SANDBOX = process.env.PA_SANDBOX === "true";

const BASE_URL = PA_SANDBOX
  ? "https://sandbox.pennylane.com"
  : "https://app.pennylane.com";

const AUTH_URL = `${BASE_URL}/oauth/authorize`;
const TOKEN_URL = `${BASE_URL}/oauth/token`;

const SCOPES = [
  "customer_invoices:all",
  "supplier_invoices:all",
  "supplier_invoices:write",
  "quotes:all",
].join(" ");

export function getAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: PA_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<OAuthTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: PA_CLIENT_ID,
      client_secret: PA_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OAuth token exchange failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return parseTokenResponse(data);
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<OAuthTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: PA_CLIENT_ID,
      client_secret: PA_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OAuth token refresh failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return parseTokenResponse(data);
}

function parseTokenResponse(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): OAuthTokens {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  };
}
