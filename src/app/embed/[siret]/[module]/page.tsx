import { verifyEmbedToken } from "@/lib/embed-auth";
import { prisma } from "@/lib/prisma";
import EmbedMessenger from "../embed-messenger";

interface Props {
  params: Promise<{ siret: string; module: string }>;
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

export default async function EmbedModulePage({ params, searchParams }: Props) {
  const { siret, module } = await params;
  const { token, accent } = await searchParams;

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

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>
      <EmbedMessenger siret={siret} token={token} />
      {module === "dashboard" && stats ? (
        <EmbedDashboard accent={accentColor} stats={stats} siret={siret} token={token} />
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
