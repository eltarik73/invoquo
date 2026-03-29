import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  siret: z
    .string()
    .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
