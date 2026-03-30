import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique macon — Logiciel devis facture BTP",
  description:
    "Logiciel de facturation electronique pour macon. Devis detailles gros oeuvre, factures conformes 2026, TVA renovation 10%. Conforme Plateforme Agreee.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/macon",
  },
};

export default function MaconPage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Macon · Gros oeuvre"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">macons</span>
          </>
        }
        subtitle="Devis gros oeuvre, factures BTP, TVA renovation 10%. Conforme et rapide."
      />

      <h2>Pourquoi un logiciel de facturation pour macon ?</h2>
      <p>
        A compter du <strong>1er septembre 2026</strong>, tous les artisans macons
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo vous met en
        conformite simplement.
      </p>

      <h2>Les taux de TVA en maconnerie</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — travaux de renovation sur un logement acheve
          depuis plus de 2 ans (extension, ouverture de mur porteur, reprise de
          fondations, ravalement)
        </li>
        <li>
          <strong>TVA 5,5%</strong> — travaux d&apos;amelioration energetique
          (isolation par l&apos;exterieur, doublage isolant)
        </li>
        <li>
          <strong>TVA 20%</strong> — construction neuve, gros oeuvre neuf
        </li>
      </ul>
      <p>
        Invoquo gere les taux de TVA ligne par ligne dans vos devis et factures au
        format <Link href="/guide/factur-x">Factur-X</Link>.
      </p>

      <h2>Devis detailles main d&apos;oeuvre et fournitures</h2>
      <p>
        En maconnerie, les chantiers combinent souvent main d&apos;oeuvre, fournitures
        (parpaings, ciment, armatures) et location de materiel. Invoquo vous permet de
        detailler chaque poste avec des lignes separees, des unites adaptees (m2, m3,
        forfait) et un recapitulatif clair pour votre client.
      </p>

      <h2>Assurance decennale obligatoire</h2>
      <p>
        Les travaux de gros oeuvre sont couverts par la garantie decennale. Invoquo
        affiche automatiquement sur vos factures le numero de contrat, le nom de
        l&apos;assureur et la couverture geographique, conformement au Code de
        l&apos;artisanat.
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
        <Link href="/signup">1 mois gratuit</Link> sans carte bancaire. Consultez nos{" "}
        <Link href="/#tarifs">tarifs</Link> pour choisir le plan adapte a votre
        activite de macon.
      </p>
    </SeoPage>
  );
}
