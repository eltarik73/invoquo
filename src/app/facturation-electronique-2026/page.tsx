import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Facturation electronique obligatoire 2026 — Guide complet",
  description: "Tout savoir sur la reforme de la facturation electronique du 1er septembre 2026. Obligations, calendrier, Plateforme Agreee, Factur-X, sanctions. Guide complet pour artisans et TPE.",
  alternates: { canonical: "https://invoquo.vercel.app/facturation-electronique-2026" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Guide complet — Mis a jour mars 2026"
        title={<>Facturation electronique <span className="text-violet-600">obligatoire 2026</span></>}
        subtitle="Tout ce que les artisans, TPE et auto-entrepreneurs doivent savoir sur la reforme du 1er septembre 2026."
      />

      <h2>Qu&apos;est-ce que la facturation electronique obligatoire ?</h2>
      <p>
        A partir du <strong>1er septembre 2026</strong>, toutes les entreprises assujetties a la TVA en France
        devront etre capables de <strong>recevoir des factures electroniques</strong> via une
        <Link href="/plateforme-agreee"> Plateforme Agreee</Link> (PA) certifiee par l&apos;Etat.
      </p>
      <p>
        Cette reforme, prevue par la loi de finances 2024, vise a lutter contre la fraude a la TVA
        et a simplifier les obligations declaratives des entreprises. Elle concerne
        <strong> toutes les entreprises</strong>, y compris les artisans, auto-entrepreneurs et TPE.
      </p>

      <h2>Calendrier de la reforme</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Obligation</th><th>Qui est concerne</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>1er sept. 2026</strong></td><td>Reception obligatoire</td><td>Toutes les entreprises assujetties TVA</td></tr>
          <tr><td><strong>1er sept. 2026</strong></td><td>Emission obligatoire</td><td>Grandes entreprises et ETI</td></tr>
          <tr><td><strong>1er sept. 2027</strong></td><td>Emission obligatoire</td><td>TPE, PME, micro-entreprises</td></tr>
        </tbody>
      </table>

      <h2>Ce qui change concretement pour vous</h2>
      <h3>1. Vous devez pouvoir recevoir des factures electroniques</h3>
      <p>
        Vos fournisseurs vous enverront des factures au format electronique via leur Plateforme Agreee.
        Vous devez etre connecte a une PA pour les recevoir. <strong>Le simple PDF par email ne sera plus conforme.</strong>
      </p>
      <h3>2. Le format Factur-X devient le standard</h3>
      <p>
        Le format <Link href="/guide/factur-x">Factur-X</Link> (PDF/A-3 avec donnees XML integrees) est le
        format standard francais. Il permet aux machines de lire les donnees de la facture automatiquement.
      </p>
      <h3>3. De nouvelles mentions sont obligatoires</h3>
      <p>
        Chaque facture devra comporter 4 nouvelles mentions : le SIREN du client (si B2B France),
        l&apos;adresse de livraison (si differente), la categorie d&apos;operation, et la mention
        TVA sur les debits si applicable. <Link href="/guide/mentions-obligatoires-facture">Voir le guide complet des mentions</Link>.
      </p>

      <h2>Sanctions en cas de non-conformite</h2>
      <ul>
        <li><strong>500 EUR</strong> des septembre 2026 si vous n&apos;avez pas de Plateforme Agreee, puis 1 000 EUR tous les 3 mois</li>
        <li><strong>15 EUR par facture</strong> non electronique</li>
        <li><strong>250 EUR par manquement</strong> e-reporting</li>
      </ul>
      <p><Link href="/guide/sanctions-facturation-electronique">En savoir plus sur les sanctions</Link></p>

      <h2>Comment se mettre en conformite ?</h2>
      <ol>
        <li><strong>Choisir un logiciel de facturation conforme</strong> connecte a une Plateforme Agreee</li>
        <li><strong>S&apos;inscrire et connecter sa PA</strong> (procedure en quelques clics)</li>
        <li><strong>Commencer a recevoir et emettre</strong> des factures electroniques</li>
      </ol>
      <p>
        <Link href="/signup" className="font-semibold">Invoquo</Link> est un logiciel de facturation electronique
        concu pour les artisans et TPE. Connecte a une Plateforme Agreee certifiee, il gere la conformite pour vous.
        <strong> 1 mois gratuit, sans carte bancaire.</strong>
      </p>
    </SeoPage>
  );
}
