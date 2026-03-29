import type {
  OAuthTokens,
  ReceivedInvoiceData,
  InvoicePayload,
  UserPayload,
  CompanyPayload,
} from "../types";

export interface PlatformAdapter {
  // Auth
  getAuthUrl(redirectUri: string, state: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens>;
  refreshToken(refreshToken: string): Promise<OAuthTokens>;

  // Réception
  pollReceivedInvoices(
    accessToken: string,
    since: Date,
  ): Promise<{
    invoices: ReceivedInvoiceData[];
    deletedIds: string[];
    lastProcessedAt: string | null;
  }>;

  // Émission
  importFacturX(
    accessToken: string,
    file: Uint8Array,
  ): Promise<{ id: string }>;

  createInvoice(
    accessToken: string,
    data: InvoicePayload,
  ): Promise<{ id: string }>;

  // Provisioning
  createUser(
    accessToken: string,
    data: UserPayload,
  ): Promise<{ id: string }>;

  createCompany(
    accessToken: string,
    data: CompanyPayload,
  ): Promise<{ id: string }>;

  completeRegistration(
    accessToken: string,
    companyId: string,
    siren: string,
  ): Promise<void>;

  // Statuts
  getInvoiceStatus(
    accessToken: string,
    invoiceId: string,
  ): Promise<string>;
}
