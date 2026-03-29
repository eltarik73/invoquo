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
    return { error: apiError("Aucune entreprise associée à ce compte", 403) };
  }
  return { tenantId };
}
