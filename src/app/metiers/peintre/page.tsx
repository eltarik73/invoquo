import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title:
    "Facturation electronique peintre en batiment — Factures conformes 2026",
  description:
    "Logiciel de facturation electronique pour peintre en batiment. Devis peinture, ravalement, decoration, TVA renovation 10%. Conforme Plateforme Agreee.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/peintre",
  },
};

export default function PeintrePage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Peintre · Ravalement"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">peintres en batiment</span>
          </>
        }
        subtitle="Devis peinture, ravalement, decoration, TVA renovation 10%. Conforme et intuitif."
      />

      <h2>Pourquoi un logiciel de facturation pour peintre ?</h2>
      <p>
        Des le <strong>1er septembre 2026</strong>, tous les peintres en batiment
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo rend cette
        obligation simple et rapide.
      </p>

      <h2>Les taux de TVA en peinture</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — travaux de peinture, ravalement de facade,
          revetements muraux dans un logement de plus de 2 ans (fournitures et main
          d&apos;oeuvre incluses)
        </li>
        <li>
          <strong>TVA 5,5%</strong> — travaux d&apos;amelioration energetique lies a
          l&apos;isolation (peinture isolante thermique, ravalement avec isolation par
          l&apos;exterieur)
        </li>
        <li>
          <strong>TVA 20%</strong> — peinture en construction neuve ou locaux de moins
          de 2 ans
        </li>
      </ul>
      <p>
        Invoquo gere les differents taux de TVA ligne par ligne dans vos devis et
        factures au format <Link href="/guide/factur-x">Factur-X</Link>.
      </p>

      <h2>Devis detailles fournitures et main d&apos;oeuvre</h2>
      <p>
        Peinture interieure, ravalement de facade, decoration, pose de papier peint,
        traitement de surfaces : detaillez la fourniture (peinture, enduit, primaire)
        et la main d&apos;oeuvre separement. Utilisez les unites adaptees (m2, forfait,
        heure) pour des devis clairs et professionnels.
      </p>

      <h2>Assurance decennale et responsabilite civile</h2>
      <p>
        Les travaux de ravalement et de peinture exterieure sont couverts par la
        garantie decennale. Invoquo affiche automatiquement sur vos factures le numero
        de contrat d&apos;assurance, le nom de l&apos;assureur et la couverture
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
        <Link href="/signup">1 mois gratuit</Link> sans carte bancaire. Consultez nos{" "}
        <Link href="/#tarifs">tarifs</Link> pour choisir le plan adapte a votre
        activite de peintre en batiment.
      </p>
    </SeoPage>
  );
}
