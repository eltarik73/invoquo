import type { PlatformAdapter } from "./interface";
import {
  getAuthUrl as oauthGetAuthUrl,
  exchangeCode as oauthExchangeCode,
  refreshAccessToken,
} from "./oauth";
import type {
  OAuthTokens,
  ReceivedInvoiceData,
  InvoicePayload,
  UserPayload,
  CompanyPayload,
  ChangelogResponse,
} from "../types";

const PA_SANDBOX = process.env.PA_SANDBOX === "true";

const API_BASE = PA_SANDBOX
  ? "https://sandbox.pennylane.com/api/external/v2"
  : "https://app.pennylane.com/api/external/v2";

const PROVISIONING_BASE = PA_SANDBOX
  ? "https://sandbox.pennylane.com/api/external/provisioning/v1"
  : "https://app.pennylane.com/api/external/provisioning/v1";

async function paFetch(
  url: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (res.status === 429) {
    // Rate limited (25 req / 5 sec) — wait and retry once
    const retryAfter = parseInt(res.headers.get("retry-after") || "5", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        ...options.headers,
      },
    });
  }

  return res;
}

export class PennylaneAdapter implements PlatformAdapter {
  // ── Auth ──

  getAuthUrl(redirectUri: string, state: string): string {
    return oauthGetAuthUrl(redirectUri, state);
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<OAuthTokens> {
    return oauthExchangeCode(code, redirectUri);
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    return refreshAccessToken(refreshToken);
  }

  // ── Réception (polling changelogs) ──

  async pollReceivedInvoices(
    accessToken: string,
    since: Date,
  ): Promise<{
    invoices: ReceivedInvoiceData[];
    deletedIds: string[];
    lastProcessedAt: string | null;
  }> {
    const invoices: ReceivedInvoiceData[] = [];
    const deletedIds: string[] = [];
    const createdOrUpdatedIds: string[] = [];
    let lastProcessedAt: string | null = null;
    let cursor: string | null = null;

    // 1. Paginate through changelogs
    do {
      const params = new URLSearchParams({
        start_date: since.toISOString(),
      });
      if (cursor) params.set("cursor", cursor);

      const res = await paFetch(
        `${API_BASE}/changelogs/supplier_invoices?${params}`,
        accessToken,
      );

      if (!res.ok) {
        throw new Error(
          `Changelog polling failed: ${res.status} ${await res.text()}`,
        );
      }

      const data: ChangelogResponse = await res.json();

      for (const entry of data.changelogs) {
        if (entry.type === "delete") {
          deletedIds.push(entry.invoice_id);
        } else {
          createdOrUpdatedIds.push(entry.invoice_id);
        }
        lastProcessedAt = entry.processed_at;
      }

      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);

    // 2. Batch fetch complete invoices for created/updated entries
    if (createdOrUpdatedIds.length > 0) {
      const fetched = await this.batchFetchSupplierInvoices(
        accessToken,
        createdOrUpdatedIds,
      );
      invoices.push(...fetched);
    }

    return { invoices, deletedIds, lastProcessedAt };
  }

  private async batchFetchSupplierInvoices(
    accessToken: string,
    ids: string[],
  ): Promise<ReceivedInvoiceData[]> {
    const results: ReceivedInvoiceData[] = [];

    // Fetch in batches of 50 to stay under rate limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      const filter = JSON.stringify([{ field: "id", operator: "in", value: batch }]);
      const params = new URLSearchParams({ filter });

      const res = await paFetch(
        `${API_BASE}/supplier_invoices?${params}`,
        accessToken,
      );

      if (!res.ok) {
        throw new Error(
          `Supplier invoices fetch failed: ${res.status} ${await res.text()}`,
        );
      }

      const data = await res.json();
      const invoices = data.invoices ?? data.data ?? [];

      for (const inv of invoices) {
        results.push(this.mapSupplierInvoice(inv));
      }
    }

    return results;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapSupplierInvoice(inv: any): ReceivedInvoiceData {
    return {
      paInvoiceId: String(inv.id),
      supplierName: inv.supplier?.name ?? inv.supplier_name ?? "Inconnu",
      supplierSiret: inv.supplier?.siret ?? inv.supplier_siret ?? null,
      invoiceNumber: inv.invoice_number ?? inv.number ?? null,
      date: inv.date ? new Date(inv.date) : null,
      dueDate: inv.due_date ? new Date(inv.due_date) : null,
      totalHT: inv.amount != null ? Number(inv.amount) : null,
      totalTTC:
        inv.amount_with_tax != null ? Number(inv.amount_with_tax) : null,
      currency: inv.currency ?? "EUR",
      paStatus: inv.e_invoicing?.status ?? inv.status ?? null,
      pdfUrl: inv.pdf_url ?? inv.file_url ?? null,
      category: inv.category?.label ?? null,
    };
  }

  // ── Émission ──

  async importFacturX(
    accessToken: string,
    file: Uint8Array,
  ): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([file.buffer as ArrayBuffer], { type: "application/pdf" }),
      "facturx.pdf",
    );

    const res = await paFetch(
      `${API_BASE}/customer_invoices/e_invoices/imports`,
      accessToken,
      { method: "POST", body: formData },
    );

    if (!res.ok) {
      throw new Error(
        `Factur-X import failed: ${res.status} ${await res.text()}`,
      );
    }

    const data = await res.json();
    return { id: String(data.id ?? data.invoice?.id) };
  }

  async createInvoice(
    accessToken: string,
    data: InvoicePayload,
  ): Promise<{ id: string }> {
    const body = {
      date: data.date,
      due_date: data.dueDate,
      currency: "EUR",
      customer: {
        name: data.clientName,
        ...(data.clientSiret ? { siret: data.clientSiret } : {}),
      },
      invoice_number: data.invoiceNumber,
      line_items: data.lines.map((line) => ({
        label: line.description,
        quantity: line.quantity,
        unit_price: line.unitPriceHT,
        vat_rate: line.vatRate,
      })),
    };

    const res = await paFetch(
      `${API_BASE}/customer_invoices`,
      accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Invoice creation failed: ${res.status} ${await res.text()}`,
      );
    }

    const result = await res.json();
    return { id: String(result.id ?? result.invoice?.id) };
  }

  // ── Provisioning ──

  async createUser(
    accessToken: string,
    data: UserPayload,
  ): Promise<{ id: string }> {
    const res = await paFetch(
      `${PROVISIONING_BASE}/users`,
      accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(
        `User provisioning failed: ${res.status} ${await res.text()}`,
      );
    }

    const result = await res.json();
    return { id: String(result.id) };
  }

  async createCompany(
    accessToken: string,
    data: CompanyPayload,
  ): Promise<{ id: string }> {
    const res = await paFetch(
      `${PROVISIONING_BASE}/companies`,
      accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          plan: "v1_freemium",
          address: data.address,
          postal_code: data.postalCode,
          city: data.city,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Company provisioning failed: ${res.status} ${await res.text()}`,
      );
    }

    const result = await res.json();
    return { id: String(result.id) };
  }

  async completeRegistration(
    accessToken: string,
    companyId: string,
    siren: string,
  ): Promise<void> {
    const res = await paFetch(
      `${PROVISIONING_BASE}/companies/${companyId}/complete_registration`,
      accessToken,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siren }),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Registration completion failed: ${res.status} ${await res.text()}`,
      );
    }
  }

  // ── Statuts ──

  async getInvoiceStatus(
    accessToken: string,
    invoiceId: string,
  ): Promise<string> {
    const res = await paFetch(
      `${API_BASE}/customer_invoices/${invoiceId}`,
      accessToken,
    );

    if (!res.ok) {
      throw new Error(
        `Invoice status fetch failed: ${res.status} ${await res.text()}`,
      );
    }

    const data = await res.json();
    return data.e_invoicing?.status ?? data.status ?? "unknown";
  }
}
