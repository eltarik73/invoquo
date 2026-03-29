import { verifyEmbedToken } from "@/lib/embed-auth";
import { prisma } from "@/lib/prisma";
import EmbedMessenger from "../embed-messenger";

interface Props {
  params: Promise<{ siret: string; module: string }>;
  searchParams: Promise<{ token?: string; accent?: string }>;
}

export default async function EmbedModulePage({
  params,
  searchParams,
}: Props) {
  const { siret, module } = await params;
  const { token, accent } = await searchParams;

  if (!token) return <EmbedError message="Token manquant" />;

  const payload = await verifyEmbedToken(token);
  if (!payload)
    return <EmbedError message="Token invalide ou expire" code="TOKEN_EXPIRED" />;
  if (payload.siret !== siret)
    return <EmbedError message="Acces non autorise" />;
  if (!payload.modules.includes(module))
    return <EmbedError message="Module non autorise" />;

  const tenant = await prisma.tenant.findUnique({
    where: { id: payload.sub },
    select: { id: true, siret: true, companyName: true, paStatus: true },
  });
  if (!tenant) return <EmbedError message="Entreprise non trouvee" />;

  const accentColor = accent ? `#${accent}` : "#7c3aed";

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>
      <EmbedMessenger siret={siret} token={token} />
      <EmbedModule module={module} accent={accentColor} />
    </div>
  );
}

function EmbedModule({ module, accent }: { module: string; accent: string }) {
  switch (module) {
    case "dashboard":
      return <EmbedDashboard accent={accent} />;
    default:
      return <EmbedPlaceholder title={MODULE_TITLES[module] || module} accent={accent} />;
  }
}

const MODULE_TITLES: Record<string, string> = {
  invoices: "Factures",
  received: "Factures recues",
  quotes: "Devis",
  clients: "Clients",
  reporting: "Reporting",
  export: "Export comptable",
  compliance: "Conformite",
  settings: "Parametres",
};

function EmbedDashboard({ accent }: { accent: string }) {
  return (
    <div>
      <div
        className="rounded-xl p-5 mb-4 text-white flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}
      >
        <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold">Creer une facture</h2>
          <p className="text-xs opacity-80">Facture conforme generee en 2 minutes</p>
        </div>
        <button
          className="ml-auto px-4 py-2 bg-white rounded-lg text-sm font-semibold shrink-0"
          style={{ color: accent }}
        >
          Nouvelle facture
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
        Plateforme Agreee connectee
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Factures emises", value: "24", change: "+3", up: true },
          { label: "Recues (PA)", value: "12", change: "+5", up: true },
          { label: "CA du mois", value: "8 420 EUR", change: "+12%", up: true },
          { label: "En retard", value: "2", change: "1 530 EUR", up: false },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-3.5">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold font-mono ${!kpi.up && i === 3 ? "text-red-600" : ""}`}>{kpi.value}</div>
            <div className="text-[10px] mt-0.5">
              <span className={kpi.up ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>{kpi.change}</span>
              <span className="text-gray-400"> vs mois prec.</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Module de facturation actif</p>
        <p>Les donnees ci-dessus sont des exemples. Connectez votre Plateforme Agreee pour voir vos vraies factures.</p>
      </div>
    </div>
  );
}

function EmbedPlaceholder({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
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
          <p className="mt-1 text-xs text-gray-500">Le token a expire. Rechargez la page.</p>
        )}
      </div>
    </div>
  );
}
