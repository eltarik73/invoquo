import { NextRequest } from "next/server";
import { apiError } from "./api-response";

/**
 * Extract tenant context from middleware-injected headers.
 * Returns the tenantId or an error response.
 */
export function getTenantId(request: NextRequest):
  | { tenantId: string; error?: never }
  | { tenantId?: never; error: ReturnType<typeof apiError> } {
  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return { error: apiError("Aucune entreprise associee a ce compte", 403) };
  }
  return { tenantId };
}

/**
 * Extract user ID from middleware-injected headers.
 */
export function getUserId(request: NextRequest): string {
  const userId = request.headers.get("x-user-id");
  if (!userId) throw new Error("User ID not found in headers");
  return userId;
}

/**
 * Extract user role from middleware-injected headers.
 */
export function getUserRole(request: NextRequest): string {
  return request.headers.get("x-user-role") || "user";
}
