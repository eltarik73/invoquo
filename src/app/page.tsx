import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/landing/nav";
import { Countdown } from "@/components/landing/countdown";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Invoquo — Facturation Electronique Conforme 2026 | Plateforme Agreee",
  description:
    "Logiciel de facturation electronique connecte a une Plateforme Agreee DGFiP. Recevez et emettez vos factures conformes sept. 2026. TPE, artisans, auto-entrepreneurs. 1 mois gratuit.",
  alternates: { canonical: "https://invoquo.vercel.app" },
};

const FEATURES = [
  { title: "Creation de factures et devis", desc: "Creez des factures conformes en quelques clics. Numerotation automatique, mentions legales, Factur-X. Convertissez vos devis en factures.", color: "bg-violet-100 text-violet-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
  { title: "Plateforme Agreee certifiee", desc: "Connectee a une Plateforme Agreee certifiee par l'Etat (NF 203, ISO 27001). Transmission automatique a l'administration.", color: "bg-emerald-100 text-emerald-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { title: "Reception automatique via PA", desc: "Recevez les factures de vos fournisseurs automatiquement via votre Plateforme Agreee. Synchronisation toutes les 10 minutes.", color: "bg-blue-100 text-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15" /> },
  { title: "E-reporting automatique", desc: "Invoquo gere le e-reporting B2C automatiquement. La Plateforme Agreee route chaque facture selon le destinataire.", color: "bg-amber-100 text-amber-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> },
  { title: "Export comptable FEC et CSV", desc: "Exportez vos donnees au format FEC (controle fiscal), CSV, rapport PDF mensuel ou archive Factur-X ZIP pour votre comptable.", color: "bg-red-100 text-red-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /> },
  { title: "Securisation et archivage 7 ans", desc: "Vos factures sont signees cryptographiquement, archivees et conservees pendant la duree legale de 7 ans.", color: "bg-violet-100 text-violet-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> },
];

const PLANS = [
  { name: "Essentiel", price: "19", popular: false, subtitle: "Réception de factures", iconBg: "bg-blue-100", iconColor: "text-blue-600",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />,
    features: [
    { t: "Réception Plateforme Agréée illimitée", ok: true },
    { t: "Dashboard et suivi des factures", ok: true },
    { t: "Notifications par email", ok: true },
    { t: "Export comptable basique", ok: true },
    { t: "Émission de factures via PA", ok: false },
    { t: "Création de factures et devis", ok: false },
  ]},
  { name: "Standard", price: "39", popular: true, subtitle: "Réception + émission", iconBg: "bg-violet-100", iconColor: "text-violet-600",
    icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></>,
    features: [
    { t: "Tout l'Essentiel", ok: true },
    { t: "Émission Plateforme Agréée illimitée", ok: true },
    { t: "Import Factur-X", ok: true },
    { t: "E-reporting automatique", ok: true },
    { t: "Suivi des statuts PA en temps réel", ok: true },
    { t: "Création de factures et devis", ok: false },
  ]},
  { name: "Pro", price: "59", popular: false, subtitle: "Tout inclus", iconBg: "bg-amber-100", iconColor: "text-amber-600",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
    features: [
    { t: "Tout le Standard", ok: true },
    { t: "Création factures, devis et avoirs", ok: true },
    { t: "5 modèles de facture personnalisables", ok: true },
    { t: "Export FEC, CSV, PDF, Factur-X", ok: true },
    { t: "Reporting et analytics", ok: true },
    { t: "Relances automatiques par email", ok: true },
  ]},
];

const CHECKS = [
  "Numerotation sequentielle conforme (sans rupture)",
  "Mentions legales obligatoires automatiques",
  "Format Factur-X pour toutes les emissions",
  "SIREN client obligatoire sur factures B2B France",
  "Categorie d'operation sur chaque facture",
  "Archivage securise et conservation 7 ans",
];

const FAQ = [
  { q: "Qu'est-ce que la reforme de la facturation electronique 2026 ?", a: "A partir du 1er septembre 2026, toutes les entreprises assujetties a la TVA devront pouvoir recevoir des factures electroniques via une Plateforme Agreee. L'obligation d'emettre des factures electroniques sera etendue progressivement." },
  { q: "Qu'est-ce qu'une Plateforme Agreee (PA) ?", a: "Une Plateforme Agreee est un intermediaire certifie par l'Etat qui transmet vos factures electroniques a l'administration fiscale. Invoquo est connecte a une PA certifiee NF 203 et ISO 27001." },
  { q: "Invoquo est-il adapte aux artisans et auto-entrepreneurs ?", a: "Oui, Invoquo est concu specifiquement pour les artisans, TPE et auto-entrepreneurs. Interface simple, mentions legales automatiques (assurance decennale, CGV), sans jargon technique." },
  { q: "Combien coute Invoquo ?", a: "A partir de 19 EUR/mois HT pour la reception de factures. Le plan Pro a 59 EUR/mois inclut la creation de factures, devis, exports comptables et reporting. 1 mois gratuit sans carte bancaire." },
  { q: "Quel format de facture electronique est utilise ?", a: "Invoquo genere des factures au format Factur-X (PDF/A-3 avec donnees XML integrees), le standard officiel francais pour la facturation electronique conforme." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4" aria-label="Presentation Invoquo">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" /></svg>
            Conforme reforme 1er septembre 2026
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Facturation electronique{" "}
            <span className="text-violet-600">conforme</span>.{" "}
            Connecte <span className="text-violet-600">Plateforme Agreee</span>.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Recevez et emettez vos factures conformes a la reforme DGFiP.
            Pour les TPE, artisans et auto-entrepreneurs. Sans prise de tete.
          </p>
          {/* PA Badge — gros et visible */}
          <div className="mt-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-sm font-semibold px-5 py-2.5 rounded-full border border-emerald-200">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" clipRule="evenodd" /></svg>
            Connecte Plateforme Agreee DGFiP
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup"><Button size="lg" className="text-base px-8">Essayer gratuitement</Button></Link>
            <Link href="#tarifs"><Button size="lg" variant="outline" className="text-base px-8">Voir les tarifs</Button></Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">1 mois gratuit · Sans carte bancaire · Sans engagement</p>
        </div>
      </section>

      {/* Urgence */}
      <section className="py-12 px-4 bg-red-50 border-y border-red-100" aria-label="Obligation legale">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Septembre 2026 : la facturation change pour tout le monde</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <p className="text-2xl font-bold font-mono text-red-600">100%</p>
              <p className="text-xs text-gray-600 mt-1">des entreprises doivent recevoir des factures electroniques</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <p className="text-2xl font-bold font-mono text-red-600">15 EUR</p>
              <p className="text-xs text-gray-600 mt-1">d&apos;amende par facture non conforme</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <p className="text-2xl font-bold font-mono text-red-600">PDF</p>
              <p className="text-xs text-gray-600 mt-1">par email ne suffit plus — il faut du Factur-X via PA</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            <Link href="/facturation-electronique-2026" className="text-violet-600 font-medium hover:underline">
              Comprendre la reforme en 5 minutes →
            </Link>
          </p>
        </div>
      </section>

      {/* Comment ca marche */}
      <section className="py-20 px-4" aria-label="Comment ca marche">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">3 etapes, 5 minutes, c&apos;est regle</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Creez votre compte", desc: "Entrez votre SIRET — les informations de votre entreprise sont remplies automatiquement via Pappers." },
              { step: "2", title: "Connectez votre PA", desc: "En 3 clics, votre espace de reception est active via la Plateforme Agreee certifiee." },
              { step: "3", title: "Vous etes en regle", desc: "Recevez vos premieres factures electroniques. Creez des devis et factures conformes." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-violet-600 text-white text-xl font-bold flex items-center justify-center mx-auto">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mt-4">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plateforme Agreee — section dediee */}
      <section className="py-20 px-4 bg-violet-50" aria-label="Plateforme Agreee">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Vos factures passent par une Plateforme Agreee de l&apos;Etat</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Invoquo est connecte a une PA officiellement immatriculee par la DGFiP.
            Vos factures sont transmises sur le reseau officiel. Pas un bricolage.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {["Plateforme Agreee DGFiP", "Format Factur-X", "Norme EN 16931", "Reseau Peppol", "E-invoicing + E-reporting"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-violet-200 text-sm font-medium text-violet-800">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                {badge}
              </div>
            ))}
          </div>
          <p className="mt-6">
            <Link href="/plateforme-agreee" className="text-sm text-violet-600 font-medium hover:underline">
              En savoir plus sur les Plateformes Agreees →
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 px-4 bg-gray-50" aria-label="Fonctionnalites">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">Tout ce qu&apos;il faut pour la facturation electronique</h2>
          <p className="text-gray-600 text-center mt-3 max-w-xl mx-auto">Invoquo gere la conformite a la reforme 2026 pour vous. Vous facturez, on s&apos;occupe du reste.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {FEATURES.map((f) => (
              <article key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center`} aria-hidden="true">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>{f.icon}</svg>
                </div>
                <h3 className="font-semibold text-gray-900 mt-4">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Artisans */}
      <section className="py-20 px-4" aria-label="Pour les artisans">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Pense pour les artisans. Adapte a tous.</h2>
          <p className="text-gray-600 mt-3">Plombier, electricien, peintre, macon, menuisier, couvreur, chauffagiste... et aussi freelances, consultants, commercants.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { name: "Plombier", href: "/metiers/plombier" },
              { name: "Electricien", href: "/metiers/electricien" },
              { name: "Peintre", href: "/metiers/peintre" },
              { name: "Macon", href: "/metiers/macon" },
              { name: "Menuisier", href: "/metiers/menuisier" },
              { name: "Couvreur", href: "/metiers/couvreur" },
              { name: "Chauffagiste", href: "/metiers/chauffagiste" },
              { name: "Carreleur", href: "/metiers/carreleur" },
            ].map((m) => (
              <Link key={m.name} href={m.href} className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                {m.name}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <Link href="/logiciel-facturation-artisan" className="text-violet-600 font-medium hover:underline">Decouvrir Invoquo pour les artisans →</Link>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 px-4 bg-gray-50" aria-label="Tarifs">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">Tarifs simples et transparents</h2>
          <p className="text-gray-600 text-center mt-3">1 mois gratuit sur tous les plans. Sans engagement, sans carte bancaire.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {PLANS.map((plan) => (
              <article key={plan.name} className={`rounded-2xl border p-8 flex flex-col ${plan.popular ? "border-violet-500 ring-2 ring-violet-200 relative" : "border-gray-200"}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Le plus populaire</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">EUR/mois HT</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.t} className="flex items-center gap-2 text-sm">
                      {f.ok ? (
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <span className={f.ok ? "text-gray-700" : "text-gray-400"}>{f.t}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8"><Button className="w-full" variant={plan.popular ? "default" : "outline"}>Essayer gratuitement</Button></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="conformite" className="py-20 px-4 bg-gray-50" aria-label="Conformite reforme 2026">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">100% conforme a la reforme de la facturation electronique</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Invoquo respecte toutes les obligations de la reforme du 1er septembre 2026. Pas de jargon, pas de stress.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 max-w-2xl mx-auto text-left">
            {CHECKS.map((c) => (
              <div key={c} className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0" aria-hidden="true">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-800">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-16 px-4 bg-gradient-to-br from-violet-600 to-violet-800" aria-label="Compte a rebours reforme 2026">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">La reforme entre en vigueur le 1er septembre 2026</h2>
          <p className="text-violet-200 mt-2">Soyez pret a temps. Inscription en 2 minutes.</p>
          <div className="mt-8"><Countdown /></div>
          <Link href="/signup"><Button size="lg" className="mt-8 bg-white text-violet-700 hover:bg-violet-50">Commencer maintenant</Button></Link>
        </div>
      </section>

      {/* FAQ — with JSON-LD FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      <section className="py-20 px-4" aria-label="Questions frequentes">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">Questions frequentes</h2>
          <div className="mt-10 space-y-6">
            {FAQ.map((item) => (
              <details key={item.q} className="group bg-white border border-gray-100 rounded-xl">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-semibold text-gray-900 hover:text-violet-600">
                  {item.q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
