import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique menuisier — Devis et factures conformes",
  description:
    "Logiciel de facturation electronique pour menuisier. Devis menuiserie interieure et exterieure, factures conformes 2026, TVA 10%. Conforme Plateforme Agreee.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/menuisier",
  },
};

export default function MenuisierPage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Menuisier · Agenceur"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">menuisiers</span>
          </>
        }
        subtitle="Devis menuiserie, factures conformes, TVA renovation 10%. Simple et rapide."
      />

      <h2>Pourquoi un logiciel de facturation pour menuisier ?</h2>
      <p>
        A partir du <strong>1er septembre 2026</strong>, tous les artisans menuisiers
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo vous
        accompagne vers la conformite sans complication.
      </p>

      <h2>Les taux de TVA en menuiserie</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — pose de fenetres, portes, volets, placards,
          cuisines dans un logement de plus de 2 ans (fournitures et main
          d&apos;oeuvre)
        </li>
        <li>
          <strong>TVA 5,5%</strong> — menuiseries exterieures ameliorant la performance
          energetique (fenetres double vitrage, portes isolantes) sous conditions
        </li>
        <li>
          <strong>TVA 20%</strong> — construction neuve, amenagements dans des locaux
          de moins de 2 ans
        </li>
      </ul>
      <p>
        Invoquo applique automatiquement le bon taux de TVA sur chaque ligne de votre
        devis ou facture au format <Link href="/guide/factur-x">Factur-X</Link>.
      </p>

      <h2>Devis detailles pour chaque projet</h2>
      <p>
        Menuiserie interieure (placards sur mesure, dressing, escaliers) ou exterieure
        (fenetres, volets, portails) : detaillez fournitures, quincaillerie et main
        d&apos;oeuvre separement. Pose de cuisine, agencement de magasin — chaque
        ligne est claire et chiffree pour votre client.
      </p>

      <h2>Assurance decennale et garanties</h2>
      <p>
        La pose de menuiseries exterieures et les travaux structurels sont couverts par
        la garantie decennale. Invoquo affiche automatiquement les informations de
        votre assurance sur chaque facture : numero de contrat, assureur et couverture
        geographique.
      </p>

      <h2>Conformite 2026 garantie</h2>
      <ul>
        <li>Transmission automatique via <Link href="/plateforme-agreee">Plateforme Agreee</Link></li>
        <li>Format <Link href="/guide/factur-x">Factur-X</Link> obligatoire</li>
        <li>Numerotation sequentielle sans rupture</li>
        <li>Toutes les <Link href="/facturation-electronique-2026">mentions legales 2026</Link> incluses</li>
        <li>SIREN client, categorie d&apos;operation, adresse de livraison</li>
      </ul>

      <h2>Tarif simple et transparent</h2>
      <p>
        A partir de <strong>19 EUR/mois HT</strong>.{" "}
        <Link href="/signup">1 mois gratuit</Link> sans carte bancaire. Decouvrez nos{" "}
        <Link href="/#tarifs">tarifs</Link> adaptes a votre activite de menuisier.
      </p>
    </SeoPage>
  );
}
