import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Plateforme Agréée — Connecté et certifié par l'État",
  description:
    "Invoquo est connecté à une Plateforme Agréée certifiée NF 203 et ISO 27001. Recevez et émettez vos factures électroniques via le circuit officiel DGFiP.",
  alternates: { canonical: "https://invoquo.vercel.app/plateforme-agreee" },
};

const ROLES = [
  { title: "Recevoir", desc: "Les factures de vos fournisseurs au format électronique structuré", bg: "bg-violet-100 text-violet-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /> },
  { title: "Émettre", desc: "Vos factures vers vos clients et l'administration fiscale", bg: "bg-emerald-100 text-emerald-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /> },
  { title: "Transmettre le e-reporting", desc: "Les données de transactions B2C à l'administration", bg: "bg-amber-100 text-amber-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> },
  { title: "Router automatiquement", desc: "Les factures selon le destinataire — B2B France, B2C, international", bg: "bg-blue-100 text-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /> },
];

const CRITERIA = [
  { emoji: "🏛", title: "Certifications", desc: "NF 203, ISO 27001 (sécurité des données)" },
  { emoji: "💰", title: "Tarification", desc: "Gratuit, au volume, ou forfaitaire selon les prestataires" },
  { emoji: "🔌", title: "Compatibilité", desc: "Votre logiciel de facturation doit être connecté à la PA" },
  { emoji: "🌍", title: "Peppol", desc: "Access Point pour les échanges internationaux" },
];

const RESOURCES: Array<{ icon: string; title: string; desc: string; href: string; external?: boolean }> = [
  { icon: "📄", title: "Guide conformité 2026", desc: "Calendrier, obligations, sanctions", href: "/conformite" },
  { icon: "📘", title: "Documentation API", desc: "Connectez votre logiciel à Invoquo", href: "/docs/api" },
  { icon: "❓", title: "Centre d'aide", desc: "FAQ, guides, tutoriels", href: "/aide" },
  { icon: "🏛", title: "Liste officielle des PA", desc: "Consultez la liste sur impots.gouv.fr", href: "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees", external: true },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-[720px] mx-auto">

          <section className="text-center mb-14">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Connecté à une Plateforme Agréée</h1>
            <p className="text-[#7c3aed] font-semibold mt-2">Certifiée par l&apos;État — NF 203, ISO 27001</p>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto" style={{ fontSize: 16, lineHeight: 1.6 }}>
              Une Plateforme Agréée (PA) est un intermédiaire certifié par la DGFiP qui assure
              la transmission des factures électroniques entre les entreprises et l&apos;administration
              fiscale. Depuis 2026, plus de 100 plateformes ont été agréées.
            </p>
          </section>

          <section className="mb-14">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: 18 }}>À quoi sert une Plateforme Agréée</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <div key={r.title} className="rounded-2xl p-5" style={{ border: "1px solid #f0edf0" }}>
                  <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>{r.icon}</svg>
                  </div>
                  <p className="font-semibold text-gray-900 mt-3" style={{ fontSize: 15 }}>{r.title}</p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: 14, lineHeight: 1.55 }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: 18 }}>Critères à vérifier</h2>
            <div className="space-y-2">
              {CRITERIA.map((c) => (
                <div key={c.title} className="flex gap-3 items-start rounded-xl p-4" style={{ border: "1px solid #f0edf0" }}>
                  <span className="text-xl shrink-0 mt-0.5">{c.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: 15 }}>{c.title}</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: 13, lineHeight: 1.55 }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: 18 }}>Invoquo et la Plateforme Agréée</h2>
            <div className="rounded-2xl p-6" style={{ background: "#faf8ff", border: "1px solid #ede8f5" }}>
              <p className="text-gray-700" style={{ fontSize: 15, lineHeight: 1.6 }}>
                Invoquo est connecté à une Plateforme Agréée certifiée NF 203 et ISO 27001.
                La connexion se fait en quelques clics depuis votre espace. Vos factures sont
                transmises automatiquement — vous n&apos;avez rien à faire.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {["NF 203", "ISO 27001", "Réseau Peppol"].map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#f3edff", color: "#7c3aed" }}>
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                    {b}
                  </span>
                ))}
              </div>
              <Link href="/signup" className="inline-flex items-center justify-center mt-5 rounded-lg bg-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] transition-colors">
                Essai gratuit — 1 mois offert →
              </Link>
            </div>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: 18 }}>Aller plus loin</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESOURCES.map((r) => (
                <Link key={r.title} href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-start gap-3 rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm" style={{ border: "1px solid #f0edf0" }}>
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-[#7c3aed] transition-colors" style={{ fontSize: 14 }}>{r.title}</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>{r.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#7c3aed] shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
