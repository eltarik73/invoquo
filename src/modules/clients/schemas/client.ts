import { z } from "zod";

export const createClientSchema = z
  .object({
    type: z.enum(["company", "individual"]).default("company"),
    companyName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    siret: z
      .string()
      .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres")
      .optional()
      .or(z.literal("")),
    siren: z
      .string()
      .regex(/^\d{9}$/, "Le SIREN doit contenir exactement 9 chiffres")
      .optional()
      .or(z.literal("")),
    vatNumber: z.string().optional(),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().length(2).default("FR"),
    deliveryAddress: z.string().optional(),
    deliveryPostalCode: z.string().optional(),
    deliveryCity: z.string().optional(),
    source: z.enum(["direct", "bativio", "klikgo"]).default("direct"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Company type requires companyName
    if (data.type === "company" && !data.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La raison sociale est obligatoire pour une entreprise",
        path: ["companyName"],
      });
    }

    // Company in France requires SIRET
    if (
      data.type === "company" &&
      data.country === "FR" &&
      !data.siret
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le SIRET est obligatoire pour une entreprise française",
        path: ["siret"],
      });
    }

    // Individual requires at least firstName or lastName
    if (
      data.type === "individual" &&
      !data.firstName &&
      !data.lastName
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom ou prénom est obligatoire pour un particulier",
        path: ["lastName"],
      });
    }
  });

export const updateClientSchema = z.object({
  type: z.enum(["company", "individual"]).optional(),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  siret: z
    .string()
    .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres")
    .optional()
    .or(z.literal("")),
  siren: z.string().optional(),
  vatNumber: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().length(2).optional(),
  deliveryAddress: z.string().optional(),
  deliveryPostalCode: z.string().optional(),
  deliveryCity: z.string().optional(),
  source: z.enum(["direct", "bativio", "klikgo"]).optional(),
  notes: z.string().optional(),
});

export const clientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  source: z.enum(["direct", "bativio", "klikgo"]).optional(),
  type: z.enum(["company", "individual"]).optional(),
  sort: z.enum(["createdAt", "companyName", "lastName"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
