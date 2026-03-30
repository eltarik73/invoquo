import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";
import { Countdown } from "@/components/landing/countdown";

export const metadata: Metadata = {
  title: "Logiciel de facturation pour artisan — Devis, factures, Factur-X",
  description:
    "Le logiciel de facturation conçu pour les artisans du bâtiment. Devis, factures conformes 2026, assurance décennale, Plateforme Agréée, Factur-X. 1 mois gratuit.",
  alternates: { canonical: "https://invoquo.vercel.app/logiciel-facturation-artisan" },
};

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    bg: "bg-violet-100 text-violet-600",
    title: "Devis en 2 minutes",
    desc: "Créez un devis professionnel, envoyez-le, convertissez-le en facture d'un clic.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: "bg-emerald-100 text-emerald-600",
    title: "Mentions légales automatiques",
    desc: "Assurance décennale, pénalités de retard, indemnité 40 €, escompte — tout est généré automatiquement.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    bg: "bg-blue-100 text-blue-600",
    title: "TVA BTP intégrée",
    desc: "Gérez les taux réduits : 10 % rénovation, 5,5 % amélioration énergétique. Sélection en un clic.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    bg: "bg-teal-100 text-teal-600",
    title: "Plateforme Agréée",
    desc: "Connectée et conforme à la réforme de la facturation électronique 2026.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    bg: "bg-amber-100 text-amber-600",
    title: "Format Factur-X",
    desc: "Le format officiel de la facturation électronique. Lisible par toutes les plateformes.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    bg: "bg-pink-100 text-pink-600",
    title: "Mobile-friendly",
    desc: "Créez un devis directement sur chantier depuis votre téléphone.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-[720px] mx-auto">

          {/* Header */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              Pour les artisans du bâtiment
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Pensé pour les artisans du bâtiment
            </h1>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto" style={{ fontSize: 16, lineHeight: 1.6 }}>
              Les artisans ont des besoins spécifiques : assurance décennale, devis détaillés,
              TVA à taux multiples, et maintenant la facturation électronique. Invoquo gère tout ça.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] transition-colors">
                Essayer gratuitement
              </Link>
              <Link href="/#tarifs" className="inline-flex items-center justify-center rounded-md border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Voir les tarifs
              </Link>
            </div>
          </section>

          {/* Features 2x3 grid */}
          <section className="mb-12">
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: 18 }}>
              Ce qu&apos;Invoquo fait pour vous
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                  style={{ border: "1px solid #f0edf0" }}
                >
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                    {f.icon}
                  </div>
                  <p className="font-semibold text-gray-900 mt-3" style={{ fontSize: 15 }}>
                    {f.title}
                  </p>
                  <p className="text-gray-500 mt-1.5" style={{ fontSize: 14, lineHeight: 1.55 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mentions artisans */}
          <section className="mb-12">
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: 18 }}>
              Mentions obligatoires pour les artisans
            </h2>
            <div
              className="rounded-2xl p-5"
              style={{ background: "#faf8ff", border: "1px solid #ede8f5" }}
            >
              <p className="text-gray-600 mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>
                En plus des mentions classiques, les artisans doivent indiquer :
              </p>
              <div className="space-y-3">
                {[
                  <>Nom et coordonnées de l&apos;<strong>assureur professionnel</strong></>,
                  <>Numéro du <strong>contrat d&apos;assurance décennale</strong></>,
                  <>Couverture <strong>géographique</strong> de l&apos;assurance</>,
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700" style={{ fontSize: 14, lineHeight: 1.55 }}>{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[#7c3aed] font-medium" style={{ fontSize: 13 }}>
                Invoquo ajoute ces mentions automatiquement dès que vous renseignez vos informations d&apos;assurance.
              </p>
            </div>
          </section>

          {/* CTA tarifs */}
          <section className="mb-12">
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-5"
              style={{ border: "1px solid #eee" }}
            >
              <p className="text-gray-700" style={{ fontSize: 15 }}>
                À partir de <strong>19 €/mois HT</strong>. 1 mois gratuit sans carte bancaire.
              </p>
              <Link
                href="/#tarifs"
                className="shrink-0 inline-flex items-center justify-center rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] transition-colors"
              >
                Voir les tarifs →
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Countdown + CTA */}
      <section className="py-14 px-4 bg-gradient-to-br from-violet-600 to-violet-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white">
            La réforme entre en vigueur le 1er septembre 2026
          </h2>
          <p className="text-violet-200 mt-2">Soyez prêt à temps.</p>
          <div className="mt-6"><Countdown /></div>
          <Link href="/signup" className="inline-flex items-center justify-center mt-6 rounded-lg bg-white px-6 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors">
            Commencer maintenant
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" fill="none" width={24} height={24}><rect width="32" height="32" rx="8" fill="#7c3aed" /><path d="M8 10h4v12H8V10z" fill="#fff" /><path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" /><circle cx="24" cy="10" r="2" fill="#a78bfa" /></svg>
            <span className="font-semibold text-gray-900 text-sm">invoquo</span>
          </div>
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Invoquo</p>
        </div>
      </footer>
    </div>
  );
}
