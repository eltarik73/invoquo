import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique carreleur — Devis et factures BTP",
  description:
    "Logiciel facturation carreleur. Carrelage, faience, mosaique, pose sol et mur, TVA 10% renovation, devis au m2. Conforme Plateforme Agreee 2026.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/carreleur",
  },
};

export default function CarreleurPage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Carreleur · Mosaiste"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">carreleurs</span>
          </>
        }
        subtitle="Devis au m2, factures conformes 2026, TVA renovation, carrelage sol et mur. Simple et rapide."
      />

      <h2>Pourquoi un logiciel de facturation pour carreleur ?</h2>
      <p>
        A partir du <strong>1er septembre 2026</strong>, tous les artisans carreleurs
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo vous permet
        d&apos;etre en conformite sans effort, pour que vous puissiez vous concentrer
        sur vos chantiers de pose.
      </p>

      <h2>Devis detailles au m2 pour le carrelage</h2>
      <p>
        En carrelage, les devis doivent etre precis : surface en m2, type de
        materiaux (gres cerame, faience, mosaique, pierre naturelle), preparation du
        support et finitions. Invoquo vous permet de creer des devis detailles ligne
        par ligne avec les unites adaptees (m2, ml, forfait) pour la pose au sol, la
        pose murale, les plinthes et les joints.
      </p>

      <h2>Les taux de TVA en carrelage</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — travaux de renovation dans un logement de plus de
          2 ans : pose de carrelage sol et mur, remplacement faience salle de bain,
          refection sols cuisine
        </li>
        <li>
          <strong>TVA 20%</strong> — construction neuve, locaux commerciaux et travaux
          hors renovation
        </li>
      </ul>
      <p>
        Invoquo gere automatiquement les differents taux de TVA ligne par ligne dans
        vos devis et factures, conformement au{" "}
        <Link href="/guide/factur-x">format Factur-X</Link>.
      </p>

      <h2>Carrelage, faience et mosaique</h2>
      <p>
        Que vous soyez specialise en pose de carrelage grand format, en faience
        decorative, en mosaique ou en pierre naturelle, Invoquo s&apos;adapte a votre
        activite. Creez des lignes de devis distinctes pour la fourniture et la pose,
        gerez vos clients particuliers et professionnels, et suivez vos factures
        en cours.
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
        activite de carreleur.
      </p>
    </SeoPage>
  );
}
