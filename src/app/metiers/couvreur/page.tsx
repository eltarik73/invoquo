import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique couvreur — Devis et factures conformes 2026",
  description:
    "Logiciel facturation couvreur. Devis toiture, zinguerie, etancheite, TVA 10% renovation, assurance decennale. Conforme Plateforme Agreee 2026.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/couvreur",
  },
};

export default function CouvreurPage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Couvreur · Zingueur"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">couvreurs</span>
          </>
        }
        subtitle="Devis toiture, factures conformes 2026, TVA renovation, assurance decennale. Simple et rapide."
      />

      <h2>Pourquoi un logiciel de facturation pour couvreur ?</h2>
      <p>
        A partir du <strong>1er septembre 2026</strong>, tous les artisans couvreurs
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo vous permet
        d&apos;etre en conformite sans effort, pour que vous puissiez vous concentrer
        sur vos chantiers.
      </p>

      <h2>Devis detailles au m2 pour la toiture</h2>
      <p>
        En couverture, les devis doivent etre precis : surface en m2, type de
        materiaux (tuiles, ardoises, zinc, bac acier), travaux de charpente associes.
        Invoquo vous permet de creer des devis detailles ligne par ligne avec les
        unites adaptees (m2, ml, forfait) et de les convertir en facture en un clic.
      </p>

      <h2>Les taux de TVA en couverture</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — travaux de renovation de toiture dans un logement
          de plus de 2 ans (remplacement tuiles, reparation charpente, etancheite,
          zinguerie)
        </li>
        <li>
          <strong>TVA 5,5%</strong> — travaux d&apos;amelioration energetique
          (isolation de toiture, sarking). Mention RGE obligatoire
        </li>
        <li>
          <strong>TVA 20%</strong> — construction neuve et travaux hors renovation
        </li>
      </ul>
      <p>
        Invoquo gere automatiquement les differents taux de TVA ligne par ligne dans
        vos devis et factures, conformement au{" "}
        <Link href="/guide/factur-x">format Factur-X</Link>.
      </p>

      <h2>Assurance decennale obligatoire</h2>
      <p>
        Les travaux de toiture, zinguerie et etancheite sont soumis a la garantie
        decennale. La loi impose aux couvreurs d&apos;afficher sur chaque facture le
        numero de contrat d&apos;assurance, le nom de l&apos;assureur et la couverture
        geographique. Invoquo ajoute ces mentions automatiquement a partir de vos
        parametres.
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
        activite de couvreur.
      </p>
    </SeoPage>
  );
}
