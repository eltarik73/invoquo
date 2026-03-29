import { z } from "zod";

const quoteLineSchema = z.object({
  description: z.string().min(1, "La désignation est requise"),
  quantity: z.number().positive("La quantité doit être positive"),
  unitPriceHT: z.number().min(0, "Le prix unitaire ne peut pas être négatif"),
  vatRate: z.number().refine(
    (v) => [0, 2.1, 5.5, 10, 20].includes(v),
    "Taux de TVA invalide (0, 2.1, 5.5, 10 ou 20)",
  ),
  unit: z.string().optional(),
});

export const createQuoteSchema = z.object({
  clientId: z.string().min(1, "Le client est requis"),
  date: z.coerce.date({ message: "La date du devis est requise" }),
  validUntil: z.coerce.date({ message: "La date de validite est requise" }),
  operationCategory: z.enum(["goods", "services", "mixed"], {
    message: "La catégorie d'opération est obligatoire",
  }),
  lines: z
    .array(quoteLineSchema)
    .min(1, "Au moins une ligne est requise"),
  notes: z.string().optional(),
}).refine(
  (data) => data.validUntil >= data.date,
  { message: "La date de validite ne peut pas etre anterieure a la date du devis", path: ["validUntil"] },
);

export const updateQuoteSchema = z.object({
  clientId: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  operationCategory: z.enum(["goods", "services", "mixed"]).optional(),
  lines: z.array(quoteLineSchema).min(1).optional(),
  notes: z.string().optional(),
});

export const quoteListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["draft", "sent", "accepted", "rejected", "expired"])
    .optional(),
  clientId: z.string().optional(),
  sort: z
    .enum(["createdAt", "date", "validUntil", "totalTTC"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteListQuery = z.infer<typeof quoteListQuerySchema>;
