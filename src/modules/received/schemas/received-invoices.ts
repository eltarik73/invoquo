import { z } from "zod";

export const receivedInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "validated", "rejected"])
    .optional(),
  sort: z
    .enum(["receivedAt", "dueDate", "totalTTC", "supplierName"])
    .default("receivedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type ReceivedInvoicesQuery = z.infer<typeof receivedInvoicesQuerySchema>;
