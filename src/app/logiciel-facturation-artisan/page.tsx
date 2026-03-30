import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Logiciel de facturation pour artisan — Devis, factures, Factur-X",
  description: "Le logiciel de facturation concu pour les artisans du batiment. Devis, factures conformes 2026, assurance decennale, Plateforme Agreee, Factur-X. 1 mois gratuit.",
  alternates: { canonical: "https://invoquo.vercel.app/logiciel-facturation-artisan" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Pour les artisans"
        title={<>Le logiciel de facturation <span className="text-violet-600">pense pour les artisans</span></>}
        subtitle="Devis, factures, mentions legales automatiques, assurance decennale. Simple, conforme, sans jargon."
      />

      <h2>Pourquoi un logiciel de facturation specifique pour les artisans ?</h2>
      <p>
        Les artisans ont des besoins specifiques en matiere de facturation : <strong>assurance decennale</strong> a mentionner,
        <strong> devis detailles</strong> avant intervention, <strong>taux de TVA multiples</strong> (20%, 10%, 5,5%
        pour la renovation), et maintenant l&apos;obligation de <strong>facturation electronique</strong>.
      </p>

      <h2>Ce qu&apos;Invoquo fait pour vous</h2>
      <ul>
        <li><strong>Devis en 2 minutes</strong> : creez un devis professionnel, envoyez-le, convertissez-le en facture d&apos;un clic</li>
        <li><strong>Mentions legales automatiques</strong> : assurance decennale, penalites de retard, indemnite 40 EUR, escompte — tout est genere automatiquement</li>
        <li><strong>TVA BTP integree</strong> : gerez les taux reduits (10% renovation, 5,5% amelioration energetique)</li>
        <li><strong>Plateforme Agreee</strong> : connectee et conforme a la <Link href="/facturation-electronique-2026">reforme 2026</Link></li>
        <li><strong>Format Factur-X</strong> : le <Link href="/guide/factur-x">format officiel</Link> de la facturation electronique</li>
        <li><strong>Mobile-friendly</strong> : creez un devis directement sur chantier depuis votre telephone</li>
      </ul>

      <h2>Mentions obligatoires pour les artisans</h2>
      <p>En plus des mentions classiques, les artisans doivent indiquer :</p>
      <ul>
        <li>Nom et coordonnees de l&apos;<strong>assureur professionnel</strong></li>
        <li>Numero du <strong>contrat d&apos;assurance decennale</strong></li>
        <li>Couverture <strong>geographique</strong> de l&apos;assurance</li>
      </ul>
      <p>Invoquo ajoute ces mentions automatiquement des que vous renseignez vos informations d&apos;assurance.</p>

      <h2>Tarifs pour les artisans</h2>
      <p>A partir de <strong>19 EUR/mois HT</strong>. 1 mois gratuit sans carte bancaire. <Link href="/#tarifs">Voir tous les tarifs</Link>.</p>
    </SeoPage>
  );
}
