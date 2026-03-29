"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// --- Logo SVG ---
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={size} height={size}>
      <rect width="32" height="32" rx="8" fill="#7c3aed" />
      <path d="M8 10h4v12H8V10z" fill="#fff" />
      <path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" />
      <circle cx="24" cy="10" r="2" fill="#a78bfa" />
    </svg>
  );
}

// --- Countdown ---
function Countdown() {
  const target = new Date("2026-09-01T00:00:00").getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const boxes = [
    { value: d, label: "jours" },
    { value: h, label: "heures" },
    { value: m, label: "minutes" },
    { value: s, label: "secondes" },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      {boxes.map((b) => (
        <div key={b.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 min-w-[70px] text-center">
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{b.value}</p>
          <p className="text-xs text-white/70 mt-0.5">{b.label}</p>
        </div>
      ))}
    </div>
  );
}

// --- Nav ---
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-bold text-gray-900">invoquo</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalites</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
          <a href="#compliance" className="hover:text-gray-900 transition-colors">Conformite</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Connexion</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Essai gratuit</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// --- Features ---
const FEATURES = [
  { title: "Creation de factures", desc: "Creez vos factures et devis conformes en quelques clics. Mentions legales automatiques.", color: "bg-violet-100 text-violet-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
  { title: "Plateforme Agreee", desc: "Connectee a une PA certifiee par l'Etat. Vos factures sont transmises automatiquement.", color: "bg-emerald-100 text-emerald-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { title: "Reception automatique", desc: "Recevez les factures de vos fournisseurs directement via votre Plateforme Agreee.", color: "bg-blue-100 text-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15" /> },
  { title: "Devis & avoirs", desc: "Creez des devis, convertissez-les en factures. Gerez les avoirs et corrections.", color: "bg-amber-100 text-amber-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /> },
  { title: "Export comptable", desc: "Exportez vos donnees au format FEC, CSV, PDF ou archive Factur-X pour votre comptable.", color: "bg-red-100 text-red-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> },
  { title: "Securisation des donnees", desc: "Vos factures sont signees, archivees et conservees pendant la duree legale.", color: "bg-violet-100 text-violet-600", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> },
];

// --- Pricing ---
const PLANS = [
  {
    name: "Essentiel",
    price: "19",
    popular: false,
    features: [
      { text: "Reception PA illimitee", included: true },
      { text: "Dashboard de suivi", included: true },
      { text: "Notifications par email", included: true },
      { text: "Export comptable basique", included: true },
      { text: "Emission de factures", included: false },
      { text: "Creation de factures", included: false },
    ],
  },
  {
    name: "Standard",
    price: "39",
    popular: true,
    features: [
      { text: "Tout l'Essentiel", included: true },
      { text: "Emission PA illimitee", included: true },
      { text: "Import Factur-X", included: true },
      { text: "E-reporting automatique", included: true },
      { text: "Suivi des statuts PA", included: true },
      { text: "Creation de factures", included: false },
    ],
  },
  {
    name: "Pro",
    price: "59",
    popular: false,
    features: [
      { text: "Tout le Standard", included: true },
      { text: "Creation factures & devis", included: true },
      { text: "5 templates personnalisables", included: true },
      { text: "Export FEC, CSV, PDF", included: true },
      { text: "Reporting & analytics", included: true },
      { text: "Relances automatiques", included: true },
    ],
  },
];

const CHECKS = [
  "Numerotation sequentielle sans rupture",
  "Mentions legales obligatoires",
  "Format Factur-X conforme",
  "SIREN client sur factures B2B",
  "Categorie d'operation obligatoire",
  "Archivage securise 7 ans",
];

// --- Page ---
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" /></svg>
            Conforme reforme sept. 2026
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Vos factures, enfin{" "}
            <span className="text-violet-600">conformes</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            La facturation electronique simple et conforme pour les artisans, TPE et auto-entrepreneurs.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Essayer gratuitement
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8">
              Voir la demo
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            1 mois gratuit · Sans carte bancaire · Sans engagement
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Tout ce qu&apos;il faut pour etre en regle
          </h2>
          <p className="text-gray-600 text-center mt-3 max-w-xl mx-auto">
            Invoquo gere la conformite pour vous. Vous facturez, on s&apos;occupe du reste.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>{f.icon}</svg>
                </div>
                <h3 className="font-semibold text-gray-900 mt-4">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">Des tarifs simples et transparents</h2>
          <p className="text-gray-600 text-center mt-3">1 mois gratuit sur tous les plans. Sans engagement.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-8 flex flex-col ${plan.popular ? "border-violet-500 ring-2 ring-violet-200 relative" : "border-gray-200"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Le plus populaire
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">EUR/mois HT</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Essayer gratuitement
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">100% conforme, sans effort</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Invoquo respecte toutes les exigences de la reforme de la facturation electronique.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 max-w-2xl mx-auto text-left">
            {CHECKS.map((c) => (
              <div key={c} className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-800">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-16 px-4 bg-gradient-to-br from-violet-600 to-violet-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            La reforme entre en vigueur le 1er septembre 2026
          </h2>
          <p className="text-violet-200 mt-2">Soyez pret a temps.</p>
          <div className="mt-8">
            <Countdown />
          </div>
          <Link href="/signup">
            <Button size="lg" className="mt-8 bg-white text-violet-700 hover:bg-violet-50">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-semibold text-gray-900">invoquo</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Invoquo. Tous droits reserves.
          </p>
        </div>
      </footer>
    </div>
  );
}
