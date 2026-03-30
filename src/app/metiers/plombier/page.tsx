import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique plombier — Logiciel devis et factures",
  description:
    "Logiciel de facturation electronique pour plombier. Devis, factures conformes 2026, assurance decennale, taux TVA renovation 10%. Conforme Plateforme Agreee.",
  alternates: {
    canonical: "https://invoquo.vercel.app/metiers/plombier",
  },
};

export default function PlombierPage() {
  return (
    <SeoPage>
      <SeoHero
        badge="Plombier · Chauffagiste"
        title={
          <>
            Facturation electronique pour{" "}
            <span className="text-violet-600">plombiers</span>
          </>
        }
        subtitle="Devis, factures, TVA renovation 10%, assurance decennale. Simple et conforme."
      />

      <h2>Pourquoi un logiciel de facturation pour plombier ?</h2>
      <p>
        A partir du <strong>1er septembre 2026</strong>, tous les artisans plombiers
        devront recevoir et emettre leurs factures au format electronique via une{" "}
        <Link href="/plateforme-agreee">Plateforme Agreee</Link>. Invoquo vous permet
        d&apos;etre en conformite sans effort.
      </p>

      <h2>Les taux de TVA en plomberie</h2>
      <ul>
        <li>
          <strong>TVA 10%</strong> — travaux de renovation dans un logement de plus de
          2 ans (remplacement chaudiere, reparation canalisation, pose sanitaire)
        </li>
        <li>
          <strong>TVA 5,5%</strong> — travaux d&apos;amelioration energetique (pompe a
          chaleur, chauffe-eau thermodynamique, solaire). Mention RGE QualiPAC
          obligatoire
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

      <h2>Assurance decennale sur vos factures</h2>
      <p>
        La loi impose aux plombiers d&apos;afficher les informations de leur assurance
        professionnelle sur chaque facture : numero de contrat, nom de l&apos;assureur
        et couverture geographique. Invoquo ajoute ces mentions automatiquement.
      </p>

      <h2>Devis obligatoire avant intervention</h2>
      <p>
        Pour tout depannage depassant 150 EUR TTC, un devis detaille est obligatoire.
        Creez vos devis en quelques clics et convertissez-les en facture une fois les
        travaux termines.
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
        activite de plombier.
      </p>
    </SeoPage>
  );
}
