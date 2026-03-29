export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface ReceivedInvoiceData {
  paInvoiceId: string;
  supplierName: string;
  supplierSiret: string | null;
  invoiceNumber: string | null;
  date: Date | null;
  dueDate: Date | null;
  totalHT: number | null;
  totalTTC: number | null;
  currency: string;
  paStatus: string | null;
  pdfUrl: string | null;
  category: string | null;
}

export interface ChangelogEntry {
  id: string;
  type: "create" | "update" | "delete";
  invoice_id: string;
  processed_at: string;
}

export interface ChangelogResponse {
  changelogs: ChangelogEntry[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface InvoicePayload {
  clientName: string;
  clientSiret?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  lines: {
    description: string;
    quantity: number;
    unitPriceHT: number;
    vatRate: number;
  }[];
}

export interface UserPayload {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface CompanyPayload {
  name: string;
  siren: string;
  address: string;
  postalCode: string;
  city: string;
}
