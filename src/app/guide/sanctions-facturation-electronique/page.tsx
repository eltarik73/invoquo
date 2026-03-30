import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Sanctions facturation electronique 2026 — Ce que vous risquez",
  description: "Quelles sanctions en cas de non-conformite a la facturation electronique en 2026 ? Amendes, penalites, delais. Ce que risquent les artisans et TPE.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/sanctions-facturation-electronique" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Sanctions"
        title={<>Sanctions facturation electronique : <span className="text-violet-600">ce que vous risquez</span></>}
        subtitle="Les amendes et penalites en cas de non-conformite a la reforme 2026."
      />

      <h2>Les sanctions prevues</h2>
      <table>
        <thead><tr><th>Infraction</th><th>Sanction</th></tr></thead>
        <tbody>
          <tr><td>Pas de Plateforme Agreee au 1er sept. 2026</td><td><strong>500 EUR</strong> puis 1 000 EUR tous les 3 mois</td></tr>
          <tr><td>Facture non electronique (PDF simple par email)</td><td><strong>15 EUR par facture</strong></td></tr>
          <tr><td>Manquement e-reporting</td><td><strong>250 EUR par declaration</strong></td></tr>
          <tr><td>Mentions obligatoires manquantes</td><td><strong>15 EUR par mention manquante</strong> par facture</td></tr>
        </tbody>
      </table>

      <h2>Comment eviter les sanctions ?</h2>
      <ol>
        <li>Connectez-vous a une <Link href="/plateforme-agreee">Plateforme Agreee</Link> <strong>avant septembre 2026</strong></li>
        <li>Utilisez un logiciel qui genere des factures au <Link href="/guide/factur-x">format Factur-X</Link></li>
        <li>Verifiez que toutes les <Link href="/guide/mentions-obligatoires-facture">mentions obligatoires</Link> sont presentes</li>
      </ol>

      <p>
        <Link href="/signup">Invoquo</Link> gere tout ca automatiquement. Inscrivez-vous en 2 minutes,
        connectez votre PA, et vous etes en conformite. <strong>1 mois gratuit.</strong>
      </p>
    </SeoPage>
  );
}
