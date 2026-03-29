import { clearAuthCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  await clearAuthCookie();
  return apiSuccess({ message: "Deconnecte" });
}
