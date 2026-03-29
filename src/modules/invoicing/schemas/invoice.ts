import { z } from "zod";

const invoiceLineSchema = z.object({
  description: z.string().min(1, "La désignation est requise"),
  quantity: z.number().positive("La quantité doit être positive"),
  unitPriceHT: z.number().min(0, "Le prix unitaire ne peut pas être négatif"),
  vatRate: z.number().refine(
    (v) => [0, 2.1, 5.5, 10, 20].includes(v),
    "Taux de TVA invalide (0, 2.1, 5.5, 10 ou 20)",
  ),
  unit: z.string().optional(),
});

const discountSchema = z
  .object({
    amount: z.number().positive(),
    type: z.enum(["percentage", "fixed"]),
  })
  .optional();

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Le client est requis"),
  type: z.enum(["invoice", "credit_note", "deposit"]).default("invoice"),
  date: z.coerce.date(),
  dueDate: z.coerce.date(),
  paymentTerms: z.enum([
    "a_reception",
    "30_days",
    "45_days_end_of_month",
    "60_days",
  ]),
  operationCategory: z.enum(["goods", "services", "mixed"], {
    message: "La catégorie d'opération est obligatoire",
  }),
  lines: z
    .array(invoiceLineSchema)
    .min(1, "Au moins une ligne est requise"),
  discount: discountSchema,
  notes: z.string().optional(),
  finalize: z.boolean().default(false),
});

export const updateInvoiceSchema = z.object({
  clientId: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  paymentTerms: z
    .enum(["a_reception", "30_days", "45_days_end_of_month", "60_days"])
    .optional(),
  operationCategory: z.enum(["goods", "services", "mixed"]).optional(),
  lines: z.array(invoiceLineSchema).min(1).optional(),
  discount: discountSchema,
  notes: z.string().optional(),
});

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      "draft",
      "pending",
      "sent",
      "transmitted",
      "accepted",
      "paid",
      "overdue",
      "rejected",
    ])
    .optional(),
  clientId: z.string().optional(),
  type: z.enum(["invoice", "credit_note", "deposit"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z
    .enum(["createdAt", "date", "dueDate", "totalTTC", "invoiceNumber"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
