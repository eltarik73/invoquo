import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Comment choisir sa Plateforme Agreee — Guide 2026",
  description: "Comment choisir la bonne Plateforme Agreee pour la facturation electronique 2026 ? Criteres, certifications, tarifs, compatibilite. Guide pour artisans et TPE.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/choisir-plateforme-agreee" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Guide pratique"
        title={<>Comment choisir sa <span className="text-violet-600">Plateforme Agreee</span></>}
        subtitle="Les criteres essentiels pour choisir la bonne PA pour votre activite."
      />
      <h2>Les 5 criteres de choix</h2>
      <ol>
        <li><strong>Certifications</strong> : NF 203 et ISO 27001 sont les standards a verifier</li>
        <li><strong>Tarification</strong> : certaines PA sont gratuites, d&apos;autres facturent au volume</li>
        <li><strong>Compatibilite logicielle</strong> : votre logiciel de facturation doit etre connecte a la PA</li>
        <li><strong>Support Peppol</strong> : si vous travaillez a l&apos;international</li>
        <li><strong>Simplicite</strong> : la connexion doit etre simple (OAuth, pas de configuration manuelle)</li>
      </ol>
      <h2>Avec Invoquo, c&apos;est deja fait</h2>
      <p>
        Invoquo est pre-connecte a une <Link href="/plateforme-agreee">Plateforme Agreee</Link> certifiee.
        Vous n&apos;avez pas a chercher, comparer ni negocier. La connexion se fait en 3 clics depuis votre espace.
      </p>
    </SeoPage>
  );
}
