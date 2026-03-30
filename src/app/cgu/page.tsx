import type { Metadata } from "next";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "CGU d'Invoquo — Conditions Générales d'Utilisation du service de facturation électronique.",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Conditions Générales d&apos;Utilisation</h1>
          <div className="rounded-2xl p-6" style={{ background: "#faf8ff", border: "1px solid #ede8f5" }}>
            <p className="text-gray-600" style={{ fontSize: 15, lineHeight: 1.65 }}>
              Les Conditions Générales d&apos;Utilisation sont en cours de rédaction et seront publiées prochainement.
            </p>
            <p className="text-gray-600 mt-3" style={{ fontSize: 15 }}>
              Pour toute question, contactez <a href="mailto:support@invoquo.fr" className="text-[#7c3aed] font-medium hover:underline">support@invoquo.fr</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
