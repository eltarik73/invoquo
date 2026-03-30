import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation électronique obligatoire 2026 — Guide complet",
  description:
    "Tout savoir sur la réforme de la facturation électronique du 1er septembre 2026. Obligations, calendrier, Plateforme Agréée, Factur-X, sanctions. Guide complet pour artisans et TPE.",
  alternates: { canonical: "https://invoquo.vercel.app/facturation-electronique-2026" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Guide complet — Mis à jour mars 2026"
        title={<>Facturation électronique <span className="text-violet-600">obligatoire 2026</span></>}
        subtitle="Tout ce que les artisans, TPE et auto-entrepreneurs doivent savoir sur la réforme du 1er septembre 2026."
      />

      {/* Sommaire */}
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 mb-12">
        <p className="text-sm font-semibold text-gray-900 mb-3">Sommaire</p>
        <ol className="space-y-1.5 text-sm">
          <li><a href="#definition" className="text-violet-600 hover:underline">Qu&apos;est-ce que la facturation électronique obligatoire ?</a></li>
          <li><a href="#calendrier" className="text-violet-600 hover:underline">Calendrier de la réforme</a></li>
          <li><a href="#changements" className="text-violet-600 hover:underline">Ce qui change concrètement</a></li>
          <li><a href="#sanctions" className="text-violet-600 hover:underline">Sanctions en cas de non-conformité</a></li>
          <li><a href="#conformite" className="text-violet-600 hover:underline">Comment se mettre en conformité</a></li>
        </ol>
      </div>

      <h2 id="definition">Qu&apos;est-ce que la facturation électronique obligatoire ?</h2>
      <p>
        À partir du <strong>1er septembre 2026</strong>, toutes les entreprises assujetties à la TVA en France
        devront être capables de <strong>recevoir des factures électroniques</strong> via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agréée</Link> (PA) certifiée par l&apos;État.
      </p>
      <p>
        Cette réforme, prévue par la loi de finances 2024, vise à lutter contre la fraude à la TVA
        et à simplifier les obligations déclaratives des entreprises. Elle concerne{" "}
        <strong>toutes les entreprises</strong>, y compris les artisans, auto-entrepreneurs et TPE.
      </p>

      <h2 id="calendrier">Calendrier de la réforme</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Obligation</th>
            <th>Qui est concerné</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1er sept. 2026</strong></td>
            <td>Réception obligatoire</td>
            <td>Toutes les entreprises assujetties TVA</td>
          </tr>
          <tr>
            <td><strong>1er sept. 2026</strong></td>
            <td>Émission obligatoire</td>
            <td>Grandes entreprises et ETI</td>
          </tr>
          <tr>
            <td><strong>1er sept. 2027</strong></td>
            <td>Émission obligatoire</td>
            <td>TPE, PME, micro-entreprises</td>
          </tr>
        </tbody>
      </table>

      <h2 id="changements">Ce qui change concrètement pour vous</h2>

      <h3>1. Vous devez pouvoir recevoir des factures électroniques</h3>
      <p>
        Vos fournisseurs vous enverront des factures au format électronique via leur Plateforme Agréée.
        Vous devez être connecté à une PA pour les recevoir.{" "}
        <strong>Le simple PDF par email ne sera plus conforme.</strong>
      </p>

      <h3>2. Le format Factur-X devient le standard</h3>
      <p>
        Le format <Link href="/guide/factur-x">Factur-X</Link> (PDF/A-3 avec données XML intégrées) est le
        format standard français. Il permet aux machines de lire les données de la facture automatiquement.
      </p>

      <h3>3. De nouvelles mentions sont obligatoires</h3>
      <p>
        Chaque facture devra comporter 4 nouvelles mentions : le SIREN du client (si B2B France),
        l&apos;adresse de livraison (si différente), la catégorie d&apos;opération, et la mention
        TVA sur les débits si applicable.{" "}
        <Link href="/guide/mentions-obligatoires-facture">Voir le guide complet des mentions</Link>.
      </p>

      <h2 id="sanctions">Sanctions en cas de non-conformité</h2>

      {/* Callout alerte */}
      <div className="not-prose rounded-xl border border-red-200 bg-red-50 p-6 my-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
          <p className="font-semibold text-red-900">Sanctions prévues</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="text-2xl font-bold font-mono text-red-600">500 €</p>
            <p className="text-xs text-red-800 mt-1">dès sept. 2026 sans PA, puis 1 000 € tous les 3 mois</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="text-2xl font-bold font-mono text-red-600">15 €</p>
            <p className="text-xs text-red-800 mt-1">par facture non électronique</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="text-2xl font-bold font-mono text-red-600">250 €</p>
            <p className="text-xs text-red-800 mt-1">par manquement e-reporting</p>
          </div>
        </div>
        <p className="text-sm text-red-800 mt-4">
          <Link href="/guide/sanctions-facturation-electronique" className="text-red-700 font-medium underline">
            En savoir plus sur les sanctions →
          </Link>
        </p>
      </div>

      <h2 id="conformite">Comment se mettre en conformité ?</h2>

      {/* Steps cards */}
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        {[
          { n: "1", title: "Choisir un logiciel conforme", desc: "Connecté à une Plateforme Agréée certifiée par l'État." },
          { n: "2", title: "S'inscrire et connecter sa PA", desc: "Procédure en quelques clics, aucune démarche administrative." },
          { n: "3", title: "Recevoir et émettre", desc: "Vos factures électroniques transitent par le circuit officiel." },
        ].map((s) => (
          <div key={s.n} className="rounded-xl border border-gray-200 p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white text-lg font-bold flex items-center justify-center mx-auto">{s.n}</div>
            <p className="font-semibold text-gray-900 mt-3 text-sm">{s.title}</p>
            <p className="text-gray-500 text-sm mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA callout */}
      <div className="not-prose rounded-xl bg-violet-50 border border-violet-200 p-6 my-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              Invoquo gère la conformité pour vous
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Logiciel de facturation électronique connecté à une Plateforme Agréée certifiée.
              Conçu pour les artisans et TPE. <strong>1 mois gratuit, sans carte bancaire.</strong>
            </p>
          </div>
          <Link href="/signup" className="shrink-0 inline-flex items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm">
            Essayer gratuitement →
          </Link>
        </div>
      </div>
    </SeoPage>
  );
}
