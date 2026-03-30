import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Plateforme Agreee (PA) — Qu'est-ce que c'est et comment choisir ?",
  description: "Qu'est-ce qu'une Plateforme Agreee ? Comment en choisir une pour la facturation electronique 2026 ? Guide complet : role, liste, criteres, connexion.",
  alternates: { canonical: "https://invoquo.vercel.app/plateforme-agreee" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Plateforme Agreee"
        title={<>Tout savoir sur les <span className="text-violet-600">Plateformes Agreees</span></>}
        subtitle="La Plateforme Agreee est l'intermediaire obligatoire entre vous et l'administration fiscale pour la facturation electronique."
      />

      <h2>Qu&apos;est-ce qu&apos;une Plateforme Agreee ?</h2>
      <p>
        Une <strong>Plateforme de Dematerialisation Partenaire</strong> (PDP), communement appelee
        <strong> Plateforme Agreee</strong> (PA), est un intermediaire certifie par l&apos;Etat
        qui assure la transmission des factures electroniques entre les entreprises et
        l&apos;administration fiscale (via le Portail Public de Facturation).
      </p>
      <p>Depuis mars 2026, <strong>101 plateformes</strong> ont ete agreees par la DGFiP.</p>

      <h2>A quoi sert une Plateforme Agreee ?</h2>
      <ul>
        <li><strong>Recevoir</strong> les factures de vos fournisseurs au format electronique</li>
        <li><strong>Emettre</strong> vos factures vers vos clients et l&apos;administration</li>
        <li><strong>Transmettre le e-reporting</strong> (donnees de transactions B2C) a l&apos;administration</li>
        <li><strong>Router automatiquement</strong> les factures selon le destinataire (B2B France, B2C, international)</li>
      </ul>

      <h2>Comment choisir sa Plateforme Agreee ?</h2>
      <p>Criteres a verifier :</p>
      <ul>
        <li><strong>Certifications</strong> : NF 203, ISO 27001 (securite des donnees)</li>
        <li><strong>Tarification</strong> : gratuit, au volume, ou forfaitaire</li>
        <li><strong>Compatibilite</strong> : votre logiciel de facturation doit etre connecte a la PA</li>
        <li><strong>Peppol</strong> : si vous travaillez avec des clients internationaux (Access Point Peppol)</li>
      </ul>

      <h2>Invoquo et la Plateforme Agreee</h2>
      <p>
        <Link href="/signup">Invoquo</Link> est connecte a une Plateforme Agreee certifiee
        NF 203 et ISO 27001. La connexion se fait en quelques clics depuis votre espace.
        Vos factures sont transmises automatiquement — vous n&apos;avez rien a faire.
      </p>
      <p>
        <Link href="/facturation-electronique-2026">En savoir plus sur la reforme 2026</Link>
      </p>
    </SeoPage>
  );
}
