import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Factur-X — Le format obligatoire de facture électronique expliqué",
  description:
    "Qu'est-ce que le format Factur-X ? Pourquoi est-il obligatoire pour la facturation électronique en 2026 ? Comment l'utiliser ? Guide simple pour artisans et TPE.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/factur-x" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Guide Factur-X"
        title={<><span className="text-violet-600">Factur-X</span> : le format de facture électronique expliqué simplement</>}
        subtitle="Le standard français de la facturation électronique, en termes simples."
      />

      <h2>Qu&apos;est-ce que Factur-X ?</h2>
      <p>
        Factur-X est un <strong>format de facture électronique hybride</strong>. C&apos;est un fichier PDF
        classique (que vous pouvez lire et imprimer) qui contient aussi des <strong>données XML intégrées</strong>{" "}
        (que les logiciels peuvent lire automatiquement).
      </p>
      <p>
        Concrètement : votre client voit une facture PDF normale, mais son logiciel de comptabilité
        peut extraire automatiquement le montant, la TVA, les références, etc.
      </p>

      <h2>Pourquoi Factur-X est-il obligatoire ?</h2>
      <p>
        La <Link href="/facturation-electronique-2026">réforme de la facturation électronique 2026</Link> impose
        l&apos;utilisation de formats structurés. Les 3 formats acceptés sont :
      </p>
      <ul>
        <li><strong>Factur-X</strong> (le plus utilisé en France — PDF + XML)</li>
        <li><strong>UBL</strong> (Universal Business Language — XML pur)</li>
        <li><strong>CII</strong> (Cross Industry Invoice — XML pur)</li>
      </ul>
      <p>
        <strong>Un simple PDF envoyé par email ne sera plus conforme</strong> à partir de septembre 2026.
      </p>

      <h2>Les 5 profils Factur-X</h2>

      {/* Custom styled table with highlight */}
      <div className="not-prose overflow-hidden rounded-xl border border-gray-200 my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Profil</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Données</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3 text-gray-600">Minimum</td>
              <td className="px-4 py-3 text-gray-600">Identifiants de base</td>
              <td className="px-4 py-3 text-gray-600">Archivage</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3 text-gray-600">Basic WL</td>
              <td className="px-4 py-3 text-gray-600">Données essentielles</td>
              <td className="px-4 py-3 text-gray-600">PME</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3 text-gray-600">Basic</td>
              <td className="px-4 py-3 text-gray-600">Données détaillées</td>
              <td className="px-4 py-3 text-gray-600">Standard</td>
            </tr>
            <tr className="border-b border-gray-100 bg-violet-50">
              <td className="px-4 py-3 font-semibold text-violet-700">
                EN 16931
                <span className="ml-2 inline-flex items-center text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">Invoquo</span>
              </td>
              <td className="px-4 py-3 text-violet-700 font-medium">Norme européenne complète</td>
              <td className="px-4 py-3 text-violet-700 font-medium">Norme EU</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-600">Extended</td>
              <td className="px-4 py-3 text-gray-600">Données étendues</td>
              <td className="px-4 py-3 text-gray-600">Grands comptes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>Invoquo génère des factures Factur-X profil <strong>EN 16931</strong>, conforme à la norme européenne.</p>

      <h2>Comment utiliser Factur-X avec Invoquo ?</h2>

      {/* Reassuring callout */}
      <div className="not-prose rounded-xl border border-emerald-200 bg-emerald-50 p-6 my-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Vous n&apos;avez rien à faire</p>
            <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
              Quand vous créez une facture dans Invoquo, elle est automatiquement générée au format
              Factur-X (profil EN 16931) et transmise via votre{" "}
              <Link href="/plateforme-agreee" className="text-emerald-700 font-medium underline">
                Plateforme Agréée
              </Link>. Aucune manipulation technique requise.
            </p>
          </div>
        </div>
      </div>
    </SeoPage>
  );
}
