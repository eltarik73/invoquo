import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Factur-X — Le format obligatoire de facture electronique explique",
  description: "Qu'est-ce que le format Factur-X ? Pourquoi est-il obligatoire pour la facturation electronique en 2026 ? Comment l'utiliser ? Guide simple pour artisans et TPE.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/factur-x" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Guide Factur-X"
        title={<><span className="text-violet-600">Factur-X</span> : le format de facture electronique explique simplement</>}
        subtitle="Le standard francais de la facturation electronique, en termes simples."
      />

      <h2>Qu&apos;est-ce que Factur-X ?</h2>
      <p>
        Factur-X est un <strong>format de facture electronique hybride</strong>. C&apos;est un fichier PDF
        classique (que vous pouvez lire et imprimer) qui contient aussi des <strong>donnees XML integrees</strong>
        (que les logiciels peuvent lire automatiquement).
      </p>
      <p>
        Concretement : votre client voit une facture PDF normale, mais son logiciel de comptabilite
        peut extraire automatiquement le montant, la TVA, les references, etc.
      </p>

      <h2>Pourquoi Factur-X est-il obligatoire ?</h2>
      <p>
        La <Link href="/facturation-electronique-2026">reforme de la facturation electronique 2026</Link> impose
        l&apos;utilisation de formats structures. Les 3 formats acceptes sont :
      </p>
      <ul>
        <li><strong>Factur-X</strong> (le plus utilise en France — PDF + XML)</li>
        <li><strong>UBL</strong> (Universal Business Language — XML pur)</li>
        <li><strong>CII</strong> (Cross Industry Invoice — XML pur)</li>
      </ul>
      <p>
        <strong>Un simple PDF envoye par email ne sera plus conforme</strong> a partir de septembre 2026.
      </p>

      <h2>Les 5 profils Factur-X</h2>
      <table>
        <thead><tr><th>Profil</th><th>Donnees</th><th>Usage</th></tr></thead>
        <tbody>
          <tr><td>Minimum</td><td>Identifiants de base</td><td>Archivage</td></tr>
          <tr><td>Basic WL</td><td>Donnees essentielles</td><td>PME</td></tr>
          <tr><td>Basic</td><td>Donnees detaillees</td><td>Standard</td></tr>
          <tr><td>EN 16931</td><td>Norme europeenne complete</td><td>Norme EU</td></tr>
          <tr><td>Extended</td><td>Donnees etendues</td><td>Grands comptes</td></tr>
        </tbody>
      </table>
      <p>Invoquo genere des factures Factur-X profil <strong>EN 16931</strong>, conforme a la norme europeenne.</p>

      <h2>Comment utiliser Factur-X avec Invoquo ?</h2>
      <p>
        Vous n&apos;avez <strong>rien a faire</strong>. Quand vous creez une facture dans Invoquo,
        elle est automatiquement generee au format Factur-X et transmise via votre
        <Link href="/plateforme-agreee"> Plateforme Agreee</Link>.
      </p>
    </SeoPage>
  );
}
