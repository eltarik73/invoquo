import { verifyEmbedToken } from "@/lib/embed-auth";
import { prisma } from "@/lib/prisma";
import type { Decimal } from "@prisma/client/runtime/client";
import EmbedMessenger from "../embed-messenger";
import EmbedInvoiceForm from "./embed-invoice-form";
import EmbedQuoteForm from "./embed-quote-form";
import EmbedClientForm from "./embed-client-form";

interface Props {
  params: Promise<{ siret: string; module: string[] }>;
  searchParams: Promise<{ token?: string; accent?: string }>;
}

interface EmbedStats {
  invoicesEmitted: number;
  invoicesReceived: number;
  caTTC: number;
  overdue: number;
  overdueAmount: number;
  deltaEmitted: number;
  deltaReceived: number;
  deltaCaPct: number;
  paConnected: boolean;
}

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  status: string;
  date: Date;
  totalTTC: Decimal;
  client: { companyName: string | null; firstName: string | null; lastName: string | null };
};

type QuoteRow = {
  id: string;
  quoteNumber: string;
  status: string;
  date: Date;
  validUntil: Date;
  totalTTC: Decimal;
  client: { companyName: string | null; firstName: string | null; lastName: string | null };
};

type ClientRow = {
  id: string;
  type: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  createdAt: Date;
  _count: { invoices: number; quotes: number };
};

export default async function EmbedModulePage({ params, searchParams }: Props) {
  const { siret, module: moduleSegments } = await params;
  const { token, accent } = await searchParams;
  const module = moduleSegments[0]; // e.g. "invoices"
  const action = moduleSegments[1]; // e.g. "new" or undefined

  if (!token) return <EmbedError message="Token manquant" />;

  const payload = await verifyEmbedToken(token);
  if (!payload) return <EmbedError message="Token invalide ou expiré" code="TOKEN_EXPIRED" />;
  if (payload.siret !== siret) return <EmbedError message="Accès non autorisé" />;
  if (!payload.modules.includes(module)) return <EmbedError message="Module non autorisé" />;

  const tenant = await prisma.tenant.findUnique({
    where: { id: payload.sub },
    select: { id: true, siret: true, companyName: true, paStatus: true },
  });
  if (!tenant) return <EmbedError message="Entreprise non trouvée" />;

  const accentColor = accent ? `#${accent}` : "#7c3aed";

  // Fetch real stats for dashboard module
  let stats: EmbedStats | null = null;
  if (module === "dashboard") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      emittedCount,
      receivedCount,
      caAgg,
      overdueCount,
      overdueAgg,
      prevEmitted,
      prevReceived,
      prevCaAgg,
    ] = await Promise.all([
      prisma.invoice.count({
        where: { tenantId: tenant.id, createdAt: { gte: startOfMonth } },
      }),
      prisma.receivedInvoice.count({
        where: { tenantId: tenant.id, receivedAt: { gte: startOfMonth } },
      }),
      prisma.invoice.aggregate({
        where: { tenantId: tenant.id, createdAt: { gte: startOfMonth }, status: { not: "draft" } },
        _sum: { totalTTC: true },
      }),
      prisma.invoice.count({
        where: { tenantId: tenant.id, status: "overdue" },
      }),
      prisma.invoice.aggregate({
        where: { tenantId: tenant.id, status: "overdue" },
        _sum: { totalTTC: true },
      }),
      prisma.invoice.count({
        where: { tenantId: tenant.id, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.receivedInvoice.count({
        where: { tenantId: tenant.id, receivedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.invoice.aggregate({
        where: { tenantId: tenant.id, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "draft" } },
        _sum: { totalTTC: true },
      }),
    ]);

    const ca = Number(caAgg._sum.totalTTC || 0);
    const prevCa = Number(prevCaAgg._sum.totalTTC || 0);

    stats = {
      invoicesEmitted: emittedCount,
      invoicesReceived: receivedCount,
      caTTC: ca,
      overdue: overdueCount,
      overdueAmount: Number(overdueAgg._sum.totalTTC || 0),
      deltaEmitted: emittedCount - prevEmitted,
      deltaReceived: receivedCount - prevReceived,
      deltaCaPct: prevCa > 0 ? Math.round(((ca - prevCa) / prevCa) * 100) : 0,
      paConnected: tenant.paStatus === "connected",
    };
  }

  // Handle "new" sub-routes (invoices/new, quotes/new, clients/new)
  if (action === "new") {
    if (module === "invoices" || module === "quotes") {
      const formClients = await prisma.client.findMany({
        where: { tenantId: tenant.id },
        orderBy: { companyName: "asc" },
        take: 200,
        select: { id: true, companyName: true, firstName: true, lastName: true },
      });
      return (
        <div style={{ "--accent": accentColor } as React.CSSProperties}>
          <EmbedMessenger siret={siret} token={token} />
          {module === "invoices"
            ? <EmbedInvoiceForm accent={accentColor} siret={siret} token={token} clients={formClients} />
            : <EmbedQuoteForm accent={accentColor} siret={siret} token={token} clients={formClients} />
          }
        </div>
      );
    }
    if (module === "clients") {
      return (
        <div style={{ "--accent": accentColor } as React.CSSProperties}>
          <EmbedMessenger siret={siret} token={token} />
          <EmbedClientForm accent={accentColor} siret={siret} token={token} />
        </div>
      );
    }
  }

  // Fetch invoices for invoices module
  let invoices: InvoiceRow[] = [];
  if (module === "invoices") {
    invoices = await prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        date: true,
        totalTTC: true,
        client: { select: { companyName: true, firstName: true, lastName: true } },
      },
    });
  }

  // Fetch quotes for quotes module
  let quotes: QuoteRow[] = [];
  if (module === "quotes") {
    quotes = await prisma.quote.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        quoteNumber: true,
        status: true,
        date: true,
        validUntil: true,
        totalTTC: true,
        client: { select: { companyName: true, firstName: true, lastName: true } },
      },
    });
  }

  // Fetch clients for clients module
  let clients: ClientRow[] = [];
  if (module === "clients") {
    clients = await prisma.client.findMany({
      where: { tenantId: tenant.id },
      orderBy: { companyName: "asc" },
      take: 50,
      select: {
        id: true,
        type: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        createdAt: true,
        _count: { select: { invoices: true, quotes: true } },
      },
    });
  }

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>
      <EmbedMessenger siret={siret} token={token} />
      {module === "dashboard" && stats ? (
        <EmbedDashboard accent={accentColor} stats={stats} siret={siret} token={token} />
      ) : module === "invoices" ? (
        <EmbedInvoiceList accent={accentColor} invoices={invoices} siret={siret} token={token} />
      ) : module === "quotes" ? (
        <EmbedQuoteList accent={accentColor} quotes={quotes} siret={siret} token={token} />
      ) : module === "clients" ? (
        <EmbedClientList accent={accentColor} clients={clients} siret={siret} token={token} />
      ) : (
        <EmbedPlaceholder title={MODULE_TITLES[module] || module} accent={accentColor} />
      )}
    </div>
  );
}

const MODULE_TITLES: Record<string, string> = {
  invoices: "Factures",
  received: "Factures reçues",
  quotes: "Devis",
  clients: "Clients",
  reporting: "Reporting",
  export: "Export comptable",
  compliance: "Conformité",
  settings: "Paramètres",
};

function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function EmbedDashboard({ accent, stats, siret, token }: { accent: string; stats: EmbedStats; siret: string; token: string }) {
  const hasData = stats.invoicesEmitted > 0 || stats.invoicesReceived > 0;

  return (
    <div>
      {/* CTA Nouvelle facture */}
      <a
        href={`/embed/${siret}/invoices?token=${token}`}
        className="rounded-xl p-5 mb-4 text-white flex items-center gap-4 no-underline"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}
      >
        <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold">Créer une facture</h2>
          <p className="text-xs opacity-80">Facture conforme générée en 2 minutes</p>
        </div>
        <span className="ml-auto px-4 py-2 bg-white rounded-lg text-sm font-semibold shrink-0" style={{ color: accent }}>
          Nouvelle facture
        </span>
      </a>

      {/* PA status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4 ${stats.paConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
        {stats.paConnected ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            Plateforme Agréée connectée
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Plateforme Agréée non connectée
          </>
        )}
      </div>

      {/* KPIs — vraies données */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <KpiCard
          label="Factures émises"
          value={String(stats.invoicesEmitted)}
          change={stats.deltaEmitted > 0 ? `+${stats.deltaEmitted}` : String(stats.deltaEmitted)}
          up={stats.deltaEmitted >= 0}
        />
        <KpiCard
          label="Reçues (PA)"
          value={String(stats.invoicesReceived)}
          change={stats.deltaReceived > 0 ? `+${stats.deltaReceived}` : String(stats.deltaReceived)}
          up={stats.deltaReceived >= 0}
        />
        <KpiCard
          label="CA du mois"
          value={formatEur(stats.caTTC)}
          change={stats.deltaCaPct !== 0 ? `${stats.deltaCaPct > 0 ? "+" : ""}${stats.deltaCaPct}%` : "—"}
          up={stats.deltaCaPct >= 0}
        />
        <KpiCard
          label="En retard"
          value={String(stats.overdue)}
          change={stats.overdue > 0 ? formatEur(stats.overdueAmount) : "—"}
          up={false}
          red={stats.overdue > 0}
        />
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-6 h-6">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700 text-sm">Aucune facture pour le moment</p>
          <p className="text-xs text-gray-500 mt-1">Créez votre première facture pour commencer</p>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, change, up, red }: { label: string; value: string; change: string; up: boolean; red?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono ${red ? "text-red-600" : ""}`}>{value}</div>
      {change !== "—" && change !== "0" && (
        <div className="text-[10px] mt-0.5">
          <span className={up ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>{change}</span>
          <span className="text-gray-400"> vs mois préc.</span>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */

function clientDisplayName(c: { companyName: string | null; firstName: string | null; lastName: string | null }): string {
  if (c.companyName) return c.companyName;
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Client sans nom";
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(n: number | Decimal): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n));
}

const INVOICE_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Brouillon", bg: "bg-gray-100", text: "text-gray-600" },
  pending: { label: "En attente", bg: "bg-orange-100", text: "text-orange-700" },
  sent: { label: "Envoyée", bg: "bg-blue-100", text: "text-blue-700" },
  transmitted: { label: "Transmise", bg: "bg-blue-100", text: "text-blue-700" },
  accepted: { label: "Acceptée", bg: "bg-emerald-100", text: "text-emerald-700" },
  paid: { label: "Payée", bg: "bg-emerald-100", text: "text-emerald-700" },
  overdue: { label: "En retard", bg: "bg-red-100", text: "text-red-700" },
  rejected: { label: "Rejetée", bg: "bg-red-100", text: "text-red-700" },
};

const QUOTE_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Brouillon", bg: "bg-gray-100", text: "text-gray-600" },
  sent: { label: "Envoyé", bg: "bg-blue-100", text: "text-blue-700" },
  accepted: { label: "Accepté", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Refusé", bg: "bg-red-100", text: "text-red-700" },
  expired: { label: "Expiré", bg: "bg-gray-100", text: "text-gray-500" },
};

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; bg: string; text: string }> }) {
  const s = map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

/* ── Invoices Module ── */

function EmbedInvoiceList({ accent, invoices, siret, token }: { accent: string; invoices: InvoiceRow[]; siret: string; token: string }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Factures</h1>
        <a
          href={`/embed/${siret}/invoices/new?token=${token}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-medium no-underline"
          style={{ backgroundColor: accent }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle facture
        </a>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-7 h-7">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700 text-sm mb-1">Aucune facture</p>
          <p className="text-xs text-gray-500 mb-4">Commencez par créer votre première facture</p>
          <a
            href={`/embed/${siret}/invoices/new?token=${token}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium no-underline"
            style={{ backgroundColor: accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer votre première facture
          </a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1.2fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            <span>N°</span>
            <span>Client</span>
            <span>Date</span>
            <span className="text-right">Montant TTC</span>
            <span className="text-right">Statut</span>
          </div>
          {/* Rows */}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.2fr_auto_auto_auto] gap-2 sm:gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</span>
                <span className="sm:hidden text-xs text-gray-500 ml-2">{formatDate(inv.date)}</span>
              </div>
              <div className="hidden sm:block text-sm text-gray-600 truncate">{clientDisplayName(inv.client)}</div>
              <div className="hidden sm:block text-sm text-gray-500 whitespace-nowrap">{formatDate(inv.date)}</div>
              <div className="text-sm font-medium text-gray-900 text-right whitespace-nowrap">{formatCurrency(inv.totalTTC)}</div>
              <div className="text-right">
                <StatusBadge status={inv.status} map={INVOICE_STATUS_MAP} />
              </div>
              {/* Mobile: client name below */}
              <div className="sm:hidden col-span-2 text-xs text-gray-500 -mt-1">{clientDisplayName(inv.client)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quotes Module ── */

function EmbedQuoteList({ accent, quotes, siret, token }: { accent: string; quotes: QuoteRow[]; siret: string; token: string }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Devis</h1>
        <a
          href={`/embed/${siret}/quotes/new?token=${token}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-medium no-underline"
          style={{ backgroundColor: accent }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau devis
        </a>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-7 h-7">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700 text-sm mb-1">Aucun devis</p>
          <p className="text-xs text-gray-500 mb-4">Commencez par créer votre premier devis</p>
          <a
            href={`/embed/${siret}/quotes/new?token=${token}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium no-underline"
            style={{ backgroundColor: accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer votre premier devis
          </a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1.2fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            <span>N°</span>
            <span>Client</span>
            <span>Date</span>
            <span className="text-right">Montant TTC</span>
            <span className="text-right">Statut</span>
          </div>
          {/* Rows */}
          {quotes.map((q) => (
            <div
              key={q.id}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.2fr_auto_auto_auto] gap-2 sm:gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">{q.quoteNumber}</span>
                <span className="sm:hidden text-xs text-gray-500 ml-2">{formatDate(q.date)}</span>
              </div>
              <div className="hidden sm:block text-sm text-gray-600 truncate">{clientDisplayName(q.client)}</div>
              <div className="hidden sm:block text-sm text-gray-500 whitespace-nowrap">{formatDate(q.date)}</div>
              <div className="text-sm font-medium text-gray-900 text-right whitespace-nowrap">{formatCurrency(q.totalTTC)}</div>
              <div className="text-right">
                <StatusBadge status={q.status} map={QUOTE_STATUS_MAP} />
              </div>
              {/* Mobile: client name below */}
              <div className="sm:hidden col-span-2 text-xs text-gray-500 -mt-1">{clientDisplayName(q.client)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Clients Module ── */

function EmbedClientList({ accent, clients, siret, token }: { accent: string; clients: ClientRow[]; siret: string; token: string }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Clients</h1>
        <a
          href={`/embed/${siret}/clients/new?token=${token}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-medium no-underline"
          style={{ backgroundColor: accent }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau client
        </a>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-7 h-7">
              <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700 text-sm mb-1">Aucun client</p>
          <p className="text-xs text-gray-500 mb-4">Ajoutez votre premier client pour commencer</p>
          <a
            href={`/embed/${siret}/clients/new?token=${token}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium no-underline"
            style={{ backgroundColor: accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter votre premier client
          </a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1.5fr_1fr_auto_auto] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            <span>Nom</span>
            <span>Contact</span>
            <span>Ville</span>
            <span className="text-right">Documents</span>
          </div>
          {/* Rows */}
          {clients.map((c) => {
            const name = clientDisplayName(c);
            const docCount = c._count.invoices + c._count.quotes;
            return (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1fr_auto_auto] gap-2 sm:gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 items-center hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{name}</span>
                  {c.type === "company" && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Entreprise</span>
                  )}
                  {c.type === "individual" && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Particulier</span>
                  )}
                </div>
                <div className="hidden sm:block text-sm text-gray-600 truncate">
                  {c.email || c.phone || "—"}
                </div>
                <div className="hidden sm:block text-sm text-gray-500 whitespace-nowrap">
                  {c.city || "—"}
                </div>
                <div className="text-sm text-gray-500 text-right whitespace-nowrap">
                  {docCount > 0 ? (
                    <span>
                      {c._count.invoices > 0 && <span>{c._count.invoices} fact.</span>}
                      {c._count.invoices > 0 && c._count.quotes > 0 && <span className="mx-1 text-gray-300">|</span>}
                      {c._count.quotes > 0 && <span>{c._count.quotes} devis</span>}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
                {/* Mobile: contact info below */}
                <div className="sm:hidden col-span-2 text-xs text-gray-500 -mt-1">
                  {[c.email, c.city].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmbedPlaceholder({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${accent}15`, color: accent }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500">Ce module sera disponible prochainement.</p>
      </div>
    </div>
  );
}

function EmbedError({ message, code }: { message: string; code?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center">
        <p className="text-red-600 font-medium">{message}</p>
        {code === "TOKEN_EXPIRED" && (
          <p className="mt-1 text-xs text-gray-500">Le token a expiré. Rechargez la page.</p>
        )}
      </div>
    </div>
  );
}
