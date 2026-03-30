import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "E-reporting TVA 2026 — Ce qui change pour les TPE",
  description: "Qu'est-ce que le e-reporting TVA ? Qui est concerne ? Comment ca marche ? Tout ce que les artisans et TPE doivent savoir sur le e-reporting en 2026.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/e-reporting-tva" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="E-reporting"
        title={<><span className="text-violet-600">E-reporting TVA</span> : ce qui change en 2026</>}
        subtitle="Le e-reporting est la transmission des donnees de transactions B2C a l'administration fiscale."
      />
      <h2>Qu&apos;est-ce que le e-reporting ?</h2>
      <p>
        Le e-reporting concerne les transactions qui ne passent pas par la facturation electronique B2B :
        les ventes aux <strong>particuliers (B2C)</strong> et les ventes a l&apos;<strong>international</strong>.
        Vous devez transmettre les donnees de ces transactions a l&apos;administration.
      </p>
      <h2>Comment ca marche avec Invoquo ?</h2>
      <p>
        La <Link href="/plateforme-agreee">Plateforme Agreee</Link> gere le routage automatiquement.
        Quand vous creez une facture dans Invoquo :
      </p>
      <ul>
        <li>Client B2B francais (avec SIREN) → <strong>e-invoicing</strong> via PA</li>
        <li>Client B2C ou international → <strong>e-reporting</strong> automatique</li>
      </ul>
      <p>Vous n&apos;avez rien a faire. Invoquo et la PA gerent tout.</p>
    </SeoPage>
  );
}
