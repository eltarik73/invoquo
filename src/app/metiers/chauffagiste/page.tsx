import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique chauffagiste — Logiciel devis facture conforme",
  description:
    "Logiciel facturation chauffagiste. Chauffage, climatisation, pompe a chaleur, RGE QualiPAC, TVA 5,5% amelioration energetique. Conforme Plateforme Agreee 2026.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/chauffagiste",
  },
};

export default function ChauffagistePage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Chauffagiste · Climaticien"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">chauffagistes</span>
          </>
        }
        subtitle="Devis chauffage et climatisation, factures conformes 2026, TVA energetique, RGE QualiPAC."
      />

      <h2>Pourquoi un logiciel de facturation pour chauffagiste ?</h2>
      <p>
        A partir du <strong>1er septembre 2026</strong>, tous les artisans chauffagistes
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo vous permet
        d&apos;etre en conformite sans effort, que vous installiez des pompes a chaleur,
        des chaudieres ou des systemes de climatisation.
      </p>

      <h2>Chauffage, climatisation et pompe a chaleur</h2>
      <p>
        Invoquo est concu pour les chauffagistes qui interviennent sur tous types
        d&apos;equipements : installation de pompes a chaleur (PAC air-air, air-eau,
        geothermie), pose de chaudieres gaz ou granules, systemes de climatisation
        reversible, planchers chauffants et radiateurs. Creez des devis detailles avec
        les references materiels et convertissez-les en facture apres intervention.
      </p>

      <h2>Les taux de TVA en chauffage</h2>
      <ul>
        <li>
          <strong>TVA 5,5%</strong> — travaux d&apos;amelioration energetique dans un
          logement de plus de 2 ans : installation pompe a chaleur, chaudiere haute
          performance, chauffe-eau thermodynamique. Mention <strong>RGE QualiPAC</strong>{" "}
          obligatoire sur la facture
        </li>
        <li>
          <strong>TVA 10%</strong> — travaux de renovation hors amelioration energetique
          (remplacement radiateurs, reparation circuit de chauffage)
        </li>
        <li>
          <strong>TVA 20%</strong> — construction neuve et equipements hors renovation
        </li>
      </ul>
      <p>
        Invoquo gere automatiquement les differents taux de TVA ligne par ligne dans
        vos devis et factures, conformement au{" "}
        <Link href="/guide/factur-x">format Factur-X</Link>.
      </p>

      <h2>Entretien annuel chaudiere</h2>
      <p>
        L&apos;entretien annuel des chaudieres est obligatoire. Invoquo vous permet de
        creer des factures recurrentes pour vos contrats d&apos;entretien, avec toutes
        les mentions legales requises. Gerez facilement votre base de clients et
        suivez les echeances d&apos;entretien.
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
        activite de chauffagiste.
      </p>
    </SeoPage>
  );
}
