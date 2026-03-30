import type { Metadata } from "next";
import Link from "next/link";
import { SeoPage, SeoHero } from "@/components/landing/seo-layout";

export const metadata: Metadata = {
  title: "Logiciel de facturation auto-entrepreneur — Conforme 2026",
  description: "Logiciel de facturation electronique pour auto-entrepreneur et micro-entreprise. Conforme a la reforme 2026, Plateforme Agreee, Factur-X, mention TVA art. 293 B. Gratuit 1 mois.",
  alternates: { canonical: "https://invoquo.vercel.app/logiciel-facturation-auto-entrepreneur" },
};

export default function Page() {
  return (
    <SeoPage>
      <SeoHero
        badge="Auto-entrepreneur"
        title={<>Facturation electronique pour <span className="text-violet-600">auto-entrepreneurs</span></>}
        subtitle="Simple, conforme, avec la mention TVA art. 293 B automatique. Concu pour les micro-entreprises."
      />

      <h2>La facturation electronique concerne aussi les auto-entrepreneurs</h2>
      <p>
        Oui, les auto-entrepreneurs et micro-entreprises sont concernes par la reforme.
        Des le <strong>1er septembre 2026</strong>, vous devez pouvoir recevoir des factures electroniques.
        L&apos;obligation d&apos;emettre interviendra au <strong>1er septembre 2027</strong>.
      </p>

      <h2>Les specificites auto-entrepreneur</h2>
      <ul>
        <li><strong>Franchise en base de TVA</strong> : Invoquo ajoute automatiquement la mention &quot;TVA non applicable, art. 293 B du CGI&quot;</li>
        <li><strong>Mention EI</strong> : la mention &quot;Entrepreneur individuel&quot; est ajoutee automatiquement</li>
        <li><strong>Numerotation simplifiee</strong> : numerotation sequentielle automatique conforme</li>
        <li><strong>Pas de comptabilite complexe</strong> : Invoquo gere les devis et factures, pas la compta</li>
      </ul>

      <h2>Combien ca coute ?</h2>
      <p>
        Le plan Essentiel a <strong>19 EUR/mois HT</strong> permet de recevoir vos factures via la Plateforme Agreee.
        Le plan Pro a <strong>59 EUR/mois HT</strong> ajoute la creation de factures et devis.
        <strong> 1 mois gratuit sans carte bancaire.</strong>
      </p>
      <p><Link href="/#tarifs">Voir tous les tarifs</Link> — <Link href="/signup">Essayer gratuitement</Link></p>
    </SeoPage>
  );
}
