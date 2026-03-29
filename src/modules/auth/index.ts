// Module: auth
// Auth functions are now in src/lib/auth.ts (cookie-based JWT)
// Pappers lookup is in src/modules/auth/lib/pappers.ts
// Schemas are in src/modules/auth/schemas/auth.ts
export { registerSchema, loginSchema } from "./schemas/auth";
export type { RegisterInput, LoginInput } from "./schemas/auth";
