import type { Metadata } from "next";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité d'Invoquo — Protection des données personnelles et conformité RGPD.",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Politique de confidentialité</h1>
          <div className="space-y-6 text-gray-600" style={{ fontSize: 15, lineHeight: 1.65 }}>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Données collectées</h2>
              <p>Invoquo collecte uniquement les données nécessaires au fonctionnement du service :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Email et mot de passe (authentification)</li>
                <li>SIRET et informations d&apos;entreprise (facturation)</li>
                <li>Données de facturation (factures, devis, clients)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Hébergement et sécurité</h2>
              <p>Les données sont hébergées en Europe. Elles ne sont pas revendues à des tiers. Les mots de passe sont hashés (bcrypt). Les communications sont chiffrées (HTTPS).</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Vos droits</h2>
              <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Contactez <a href="mailto:support@invoquo.fr" className="text-[#7c3aed] font-medium hover:underline">support@invoquo.fr</a>.</p>
            </section>
            <div className="rounded-2xl p-5 mt-4" style={{ background: "#faf8ff", border: "1px solid #ede8f5" }}>
              <p className="text-sm text-gray-500">La politique de confidentialité complète est en cours de rédaction et sera publiée prochainement.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
