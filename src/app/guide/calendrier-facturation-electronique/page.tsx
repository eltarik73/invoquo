import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Calendrier facturation electronique 2026-2027 — Dates cles",
  description: "Le calendrier complet de la reforme de la facturation electronique. Dates d'obligation reception (sept 2026) et emission (sept 2027). Planning pour se preparer.",
  alternates: { canonical: "https://invoquo.vercel.app/guide/calendrier-facturation-electronique" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Calendrier"
        title={<>Calendrier de la <span className="text-violet-600">facturation electronique</span></>}
        subtitle="Toutes les dates cles de la reforme 2026-2027 pour ne rien rater."
      />

      <h2>Les dates a retenir</h2>
      <table>
        <thead><tr><th>Date</th><th>Quoi</th><th>Qui</th></tr></thead>
        <tbody>
          <tr><td><strong>1er sept. 2026</strong></td><td>Obligation de reception</td><td>Toutes les entreprises</td></tr>
          <tr><td><strong>1er sept. 2026</strong></td><td>Obligation d&apos;emission</td><td>Grandes entreprises + ETI</td></tr>
          <tr><td><strong>1er sept. 2026</strong></td><td>E-reporting obligatoire</td><td>Grandes entreprises + ETI</td></tr>
          <tr><td><strong>1er sept. 2027</strong></td><td>Obligation d&apos;emission</td><td>TPE, PME, micro-entreprises</td></tr>
          <tr><td><strong>1er sept. 2027</strong></td><td>E-reporting obligatoire</td><td>TPE, PME, micro-entreprises</td></tr>
        </tbody>
      </table>

      <h2>Ce que ca veut dire pour vous</h2>
      <p>
        Si vous etes artisan, auto-entrepreneur ou TPE : vous devez pouvoir <strong>recevoir</strong>
        des factures electroniques des le <strong>1er septembre 2026</strong>. L&apos;obligation
        d&apos;<strong>emettre</strong> arrive un an plus tard.
      </p>
      <p>
        Notre conseil : ne pas attendre. <Link href="/signup">Inscrivez-vous maintenant</Link> et
        prenez le temps de vous familiariser avec l&apos;outil. <strong>1 mois gratuit.</strong>
      </p>
    </SeoPage>
  );
}
