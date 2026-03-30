import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique electricien — Devis, factures, conformite 2026",
  description:
    "Logiciel de facturation electronique pour electricien. Devis, factures conformes 2026, certification Qualifelec, assurance decennale. Conforme Plateforme Agreee.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/electricien",
  },
};

export default function ElectricienPage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Electricien · Domotique"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">electriciens</span>
          </>
        }
        subtitle="Devis, factures, certification Qualifelec, assurance decennale. Conforme et simple."
      />

      <h2>Pourquoi un logiciel de facturation pour electricien ?</h2>
      <p>
        Des le <strong>1er septembre 2026</strong>, tous les electriciens devront
        recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo simplifie
        cette transition pour les artisans electriciens.
      </p>

      <h2>Les taux de TVA en electricite</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — renovation electrique dans un logement de plus de
          2 ans (mise aux normes tableau electrique, remplacement prises et
          interrupteurs, tirage de cables)
        </li>
        <li>
          <strong>TVA 5,5%</strong> — travaux d&apos;amelioration energetique
          (installation domotique pour economies d&apos;energie, bornes de recharge
          vehicules electriques)
        </li>
        <li>
          <strong>TVA 20%</strong> — construction neuve, installations dans des locaux
          de moins de 2 ans
        </li>
      </ul>
      <p>
        Invoquo applique le bon taux de TVA ligne par ligne dans vos devis et factures
        au format <Link href="/guide/factur-x">Factur-X</Link>.
      </p>

      <h2>Certification Qualifelec et assurance decennale</h2>
      <p>
        Affichez votre certification Qualifelec et les informations de votre assurance
        decennale directement sur vos factures. Invoquo ajoute automatiquement le
        numero de contrat, le nom de l&apos;assureur et la couverture geographique
        conformement a la loi.
      </p>

      <h2>Devis detailles pour vos chantiers</h2>
      <p>
        Tableaux electriques, domotique, mise aux normes NF C 15-100 : creez des devis
        detailles avec fournitures et main d&apos;oeuvre separees. Convertissez chaque
        devis en facture en un clic.
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
        <Link href="/#tarifs">tarifs</Link> adaptes a votre activite d&apos;electricien.
      </p>
    </SeoPage>
  );
}
