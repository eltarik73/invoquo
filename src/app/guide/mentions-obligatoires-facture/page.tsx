import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Mentions obligatoires facture 2026 — Liste complete",
  description: "Les 22 mentions obligatoires sur une facture en 2026. Nouvelles mentions de la reforme (SIREN client, categorie d'operation, adresse livraison). Checklist complete.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/mentions-obligatoires-facture" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Guide pratique"
        title={<>Mentions obligatoires sur une facture en <span className="text-violet-600">2026</span></>}
        subtitle="La liste complete des mentions requises, y compris les 4 nouvelles mentions de la reforme."
      />

      <h2>Les mentions existantes (Code de commerce)</h2>
      <ol>
        <li>Date d&apos;emission</li>
        <li>Numero unique sequentiel sans rupture</li>
        <li>Date de la vente ou prestation</li>
        <li>Identite de l&apos;emetteur (nom, adresse, SIRET, forme juridique)</li>
        <li>Identite du client (nom, adresse)</li>
        <li>N° TVA intracommunautaire (si &gt; 150 EUR HT)</li>
        <li>N° bon de commande (si applicable)</li>
        <li>Designation precise des produits/prestations</li>
        <li>Decomptage detaille (quantite, prix unitaire HT, taux TVA)</li>
        <li>Total HT et TTC</li>
        <li>Reductions eventuelles</li>
        <li>Date de reglement et conditions d&apos;escompte</li>
        <li>Taux de penalites de retard</li>
        <li>Indemnite forfaitaire de recouvrement <strong>40 EUR</strong></li>
      </ol>

      <h2>Les 4 nouvelles mentions (reforme sept. 2026)</h2>
      <ol start={15}>
        <li><strong>SIREN du client</strong> (obligatoire si entreprise en France)</li>
        <li><strong>Adresse de livraison</strong> (si differente de l&apos;adresse client)</li>
        <li><strong>Categorie d&apos;operation</strong> : &quot;Livraison de biens&quot;, &quot;Prestation de services&quot; ou &quot;Mixte&quot;</li>
        <li><strong>&quot;Option pour le paiement de la TVA d&apos;apres les debits&quot;</strong> (si applicable)</li>
      </ol>

      <h2>Mentions specifiques artisans</h2>
      <ul>
        <li>Assurance professionnelle (numero de contrat, nom de l&apos;assureur, couverture geographique)</li>
        <li>&quot;Membre d&apos;une association agreee&quot; (si applicable)</li>
      </ul>

      <h2>Mentions conditionnelles</h2>
      <ul>
        <li>&quot;TVA non applicable, art. 293 B du CGI&quot; (franchise en base)</li>
        <li>&quot;Autoliquidation&quot; (sous-traitance BTP)</li>
      </ul>

      <h2>Invoquo genere tout automatiquement</h2>
      <p>
        Avec <Link href="/signup">Invoquo</Link>, toutes ces mentions sont generees automatiquement
        en fonction de votre profil et de celui de votre client. Vous n&apos;avez rien a retenir.
      </p>
    </SeoPage>
  );
}
