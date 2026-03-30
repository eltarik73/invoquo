import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Facturation electronique obligatoire 2026 — Guide conformite",
  description:
    "Tout comprendre sur la reforme de la facturation electronique 2026. Calendrier, obligations, sanctions, et comment se mettre en conformite avec Invoquo.",
  alternates: { canonical: "https://invoquo.vercel.app/conformite" },
};

export default function ConformitePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-[680px] mx-auto">
          {/* ── 1. Header ── */}
          <section className="mb-12">
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: 28, lineHeight: 1.25 }}
            >
              Facturation electronique obligatoire
              <br />
              <span className="text-[#7c3aed]">
                Ce que ca change pour vous
              </span>
            </h1>
            <p
              className="mt-5 text-gray-500"
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 580,
              }}
            >
              A partir du 1er septembre 2026, toutes les entreprises assujetties
              a la TVA devront etre capables de recevoir des factures
              electroniques via une Plateforme Agreee (PA) certifiee par
              l&apos;Etat. Cette reforme, prevue par la loi de finances 2024,
              concerne toutes les entreprises, y compris les artisans,
              auto-entrepreneurs et TPE.
            </p>
          </section>

          {/* ── 2. Calendrier ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-4"
              style={{ fontSize: 18 }}
            >
              Calendrier de la reforme
            </h2>
            <div
              className="overflow-hidden"
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
              }}
            >
              <table className="w-full text-left" style={{ fontSize: 14 }}>
                <thead>
                  <tr
                    style={{
                      background: "#faf8ff",
                    }}
                  >
                    <th
                      className="px-4 py-3 font-bold text-[#7c3aed]"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Date
                    </th>
                    <th
                      className="px-4 py-3 font-bold text-[#7c3aed]"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Obligation
                    </th>
                    <th
                      className="px-4 py-3 font-bold text-[#7c3aed]"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Qui
                    </th>
                  </tr>
                </thead>
                <tbody style={{ lineHeight: 1.55 }}>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      1er sept. 2026
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Reception obligatoire
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block font-bold whitespace-nowrap"
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#f3edff",
                          color: "#7c3aed",
                        }}
                      >
                        Toutes les entreprises assujetties TVA
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      1er sept. 2026
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Emission obligatoire
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block font-bold whitespace-nowrap"
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#ecfdf5",
                          color: "#059669",
                        }}
                      >
                        Grandes entreprises et ETI
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      1er sept. 2027
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Emission obligatoire
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block font-bold whitespace-nowrap"
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#f3edff",
                          color: "#7c3aed",
                        }}
                      >
                        TPE, PME, micro-entreprises
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── 3. Ce qui change ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-4"
              style={{ fontSize: 18 }}
            >
              Ce qui change concretement
            </h2>
            <div className="space-y-2">
              {/* Item 1 */}
              <div
                className="flex gap-3 items-start transition-colors"
                style={{
                  border: "1px solid #f0edf0",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#f3edff",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    Reception de factures electroniques
                  </p>
                  <p
                    className="text-gray-500 mt-1"
                    style={{ fontSize: 13, lineHeight: 1.55 }}
                  >
                    Vos fournisseurs vous enverront des factures au format
                    electronique via leur Plateforme Agreee. Un simple PDF par
                    email ne sera plus conforme.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div
                className="flex gap-3 items-start"
                style={{
                  border: "1px solid #f0edf0",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#ecfdf5",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#059669"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    Le format Factur-X devient le standard
                  </p>
                  <p
                    className="text-gray-500 mt-1"
                    style={{ fontSize: 13, lineHeight: 1.55 }}
                  >
                    Le format{" "}
                    <Link
                      href="/guide/factur-x"
                      className="text-[#7c3aed] font-medium hover:underline"
                    >
                      Factur-X
                    </Link>{" "}
                    (PDF/A-3 avec donnees XML integrees) est le standard
                    francais. Il permet aux logiciels de lire les donnees
                    automatiquement.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div
                className="flex gap-3 items-start"
                style={{
                  border: "1px solid #f0edf0",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#fef9ee",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    De nouvelles mentions obligatoires
                  </p>
                  <p
                    className="text-gray-500 mt-1"
                    style={{ fontSize: 13, lineHeight: 1.55 }}
                  >
                    SIREN du client (B2B France), adresse de livraison,
                    categorie d&apos;operation, TVA sur les debits.{" "}
                    <Link
                      href="/guide/mentions-obligatoires-facture"
                      className="text-[#7c3aed] font-medium hover:underline"
                    >
                      Voir la liste complete
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4. Sanctions ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-4"
              style={{ fontSize: 18 }}
            >
              Sanctions en cas de non-conformite
            </h2>
            <div
              style={{
                border: "1px solid #fde6a8",
                background: "#fffdf5",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <h4
                className="flex items-center gap-2 font-bold"
                style={{ fontSize: 14, color: "#92400e" }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="#d97706"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
                A retenir
              </h4>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <p
                    className="font-bold"
                    style={{ fontSize: 20, color: "#d97706" }}
                  >
                    500 EUR
                  </p>
                  <p style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.5 }}>
                    si pas de PA des sept. 2026, puis 1 000 EUR tous les 3 mois
                  </p>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p
                    className="font-bold"
                    style={{ fontSize: 20, color: "#d97706" }}
                  >
                    15 EUR
                  </p>
                  <p style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.5 }}>
                    par facture non electronique
                  </p>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p
                    className="font-bold"
                    style={{ fontSize: 20, color: "#d97706" }}
                  >
                    250 EUR
                  </p>
                  <p style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.5 }}>
                    par manquement e-reporting
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. Comment se mettre en conformite ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-4"
              style={{ fontSize: 18 }}
            >
              Comment se mettre en conformite
            </h2>
            <div
              style={{
                border: "1px solid #ede8f5",
                background: "#faf8ff",
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <h4
                className="flex items-center gap-2 font-bold"
                style={{ fontSize: 14, color: "#7c3aed" }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="#7c3aed"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
                3 etapes simples
              </h4>

              <div className="relative mt-5 ml-[14px] pl-7 space-y-5">
                {/* Connecting line */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: 0,
                    width: 1.5,
                    background: "#ede8f5",
                  }}
                />

                {/* Step 1 */}
                <div className="relative">
                  <div
                    className="absolute flex items-center justify-center font-bold text-white"
                    style={{
                      left: -35,
                      top: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#7c3aed",
                      fontSize: 13,
                    }}
                  >
                    1
                  </div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    Choisir un logiciel de facturation conforme
                  </p>
                  <p
                    className="text-gray-500 mt-0.5"
                    style={{ fontSize: 13, lineHeight: 1.55 }}
                  >
                    Connecte a une Plateforme Agreee certifiee par l&apos;Etat.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div
                    className="absolute flex items-center justify-center font-bold text-white"
                    style={{
                      left: -35,
                      top: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#7c3aed",
                      fontSize: 13,
                    }}
                  >
                    2
                  </div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    S&apos;inscrire et connecter sa PA
                  </p>
                  <p
                    className="text-gray-500 mt-0.5"
                    style={{ fontSize: 13, lineHeight: 1.55 }}
                  >
                    Procedure en quelques clics, aucune demarche
                    administrative.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div
                    className="absolute flex items-center justify-center font-bold text-white"
                    style={{
                      left: -35,
                      top: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#7c3aed",
                      fontSize: 13,
                    }}
                  >
                    3
                  </div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    Commencer a recevoir et emettre
                  </p>
                  <p
                    className="text-gray-500 mt-0.5"
                    style={{ fontSize: 13, lineHeight: 1.55 }}
                  >
                    Vos factures electroniques transitent automatiquement par
                    le circuit officiel.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 6. CTA ── */}
          <section>
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{
                background: "#7c3aed",
                borderRadius: 14,
                padding: "20px 24px",
              }}
            >
              <p
                className="text-white flex-1"
                style={{ fontSize: 14, lineHeight: 1.6 }}
              >
                <strong>Invoquo</strong> est un logiciel de facturation
                electronique concu pour les artisans et TPE. Connecte a une
                Plateforme Agreee certifiee, il gere la conformite pour vous.{" "}
                <strong>1 mois gratuit, sans carte bancaire.</strong>
              </p>
              <Link
                href="/signup"
                className="shrink-0 inline-flex items-center justify-center font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: "white",
                  color: "#7c3aed",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 14,
                }}
              >
                Essai gratuit →
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              width={24}
              height={24}
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="#7c3aed" />
              <path d="M8 10h4v12H8V10z" fill="#fff" />
              <path
                d="M15 10h4l5 12h-4l-5-12z"
                fill="#fff"
                opacity=".9"
              />
              <circle cx="24" cy="10" r="2" fill="#a78bfa" />
            </svg>
            <span className="font-semibold text-gray-900 text-sm">
              invoquo
            </span>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Invoquo
          </p>
        </div>
      </footer>
    </div>
  );
}
