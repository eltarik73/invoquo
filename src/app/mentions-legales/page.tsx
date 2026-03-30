import type { Metadata } from "next";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Invoquo — Éditeur, hébergement, contact.",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mentions légales</h1>
          <div className="space-y-6 text-gray-600" style={{ fontSize: 15, lineHeight: 1.65 }}>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Éditeur</h2>
              <p>Invoquo SAS</p>
              <p>Chambéry, France</p>
              <p>Contact : support@invoquo.fr</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Hébergement</h2>
              <p>Vercel Inc. — San Francisco, CA, États-Unis</p>
              <p>Base de données : Railway — hébergement Europe</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Directeur de la publication</h2>
              <p>Tarik Boudefar</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 16 }}>Propriété intellectuelle</h2>
              <p>L&apos;ensemble du contenu du site invoquo.fr (textes, images, logos, logiciel) est protégé par le droit d&apos;auteur. Toute reproduction est interdite sans autorisation préalable.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
