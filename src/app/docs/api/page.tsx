import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Documentation API Invoquo — Intégration facturation électronique",
  description:
    "Documentez et intégrez la facturation électronique dans votre application grâce à l'API REST Invoquo. Endpoints, authentification, exemples et SDK embed.",
  alternates: { canonical: "https://invoquo.vercel.app/docs/api" },
};

const codeBlockStyle: React.CSSProperties = {
  background: "#1e1e2e",
  color: "#cdd6f4",
  borderRadius: 10,
  padding: "18px 22px",
  fontSize: 13,
  lineHeight: 1.7,
  overflowX: "auto",
  fontFamily: "'DM Mono', monospace",
};

const getBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#dcfce7",
  color: "#166534",
  fontSize: 11,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 4,
  fontFamily: "'DM Mono', monospace",
  letterSpacing: 0.3,
};

const postBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#dbeafe",
  color: "#1e40af",
  fontSize: 11,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 4,
  fontFamily: "'DM Mono', monospace",
  letterSpacing: 0.3,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 14px",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

const endpoints = [
  { method: "GET", path: "/api/v1/clients", description: "Liste des clients" },
  { method: "POST", path: "/api/v1/clients", description: "Créer un client" },
  {
    method: "GET",
    path: "/api/v1/invoices",
    description: "Liste des factures",
  },
  {
    method: "POST",
    path: "/api/v1/invoices",
    description: "Créer une facture",
  },
  {
    method: "GET",
    path: "/api/v1/invoices/:id",
    description: "Détail d\u2019une facture",
  },
  { method: "GET", path: "/api/v1/quotes", description: "Liste des devis" },
  { method: "POST", path: "/api/v1/quotes", description: "Créer un devis" },
  {
    method: "POST",
    path: "/api/v1/quotes/:id/convert",
    description: "Convertir un devis en facture",
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    description: "Statistiques (CA, factures, impayés)",
  },
  {
    method: "POST",
    path: "/api/v1/embed/token",
    description: "Générer un jeton embed (iframe)",
  },
];

export default function DocsApiPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-[720px] mx-auto">
          {/* ── Header ── */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1
                className="font-bold tracking-tight text-gray-900"
                style={{ fontSize: 28, lineHeight: 1.25 }}
              >
                Documentation API
              </h1>
              <span
                style={{
                  display: "inline-block",
                  background: "#f5f3ff",
                  color: "#7c3aed",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                REST API v1
              </span>
            </div>
            <p
              className="text-gray-500"
              style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 580 }}
            >
              Intégrez la facturation électronique conforme dans votre
              application. L&apos;API Invoquo vous permet de créer des factures,
              gérer vos clients et automatiser vos flux comptables via une
              interface REST simple et documentée.
            </p>
          </section>

          {/* ── Authentification ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-3"
              style={{ fontSize: 18 }}
            >
              Authentification
            </h2>
            <p
              className="text-gray-500 mb-4"
              style={{ fontSize: 14.5, lineHeight: 1.6 }}
            >
              Toutes les requêtes doivent inclure votre clé API dans
              l&apos;en-tête <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">X-Api-Key</code>.
              Vous pouvez générer votre clé depuis les paramètres de votre
              compte Invoquo.
            </p>
            <pre style={codeBlockStyle}>
              <code>{`curl -X GET https://app.invoquo.fr/api/v1/invoices \\
  -H "X-Api-Key: votre_cle_api" \\
  -H "Content-Type: application/json"`}</code>
            </pre>
          </section>

          {/* ── Endpoints ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-3"
              style={{ fontSize: 18 }}
            >
              Endpoints
            </h2>
            <p
              className="text-gray-500 mb-5"
              style={{ fontSize: 14.5, lineHeight: 1.6 }}
            >
              L&apos;API expose les endpoints suivants. Toutes les réponses
              suivent le format{" "}
              <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                {`{ success, data, error, timestamp }`}
              </code>.
            </p>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>Méthode</th>
                    <th style={thStyle}>Endpoint</th>
                    <th style={thStyle}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((ep) => (
                    <tr key={`${ep.method}-${ep.path}`}>
                      <td style={tdStyle}>
                        <span
                          style={ep.method === "GET" ? getBadge : postBadge}
                        >
                          {ep.method}
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {ep.path}
                      </td>
                      <td style={{ ...tdStyle, color: "#6b7280" }}>
                        {ep.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Exemple de requête ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-3"
              style={{ fontSize: 18 }}
            >
              Exemple : créer une facture
            </h2>
            <p
              className="text-gray-500 mb-4"
              style={{ fontSize: 14.5, lineHeight: 1.6 }}
            >
              Voici un exemple complet de création de facture via
              l&apos;API. La facture est automatiquement générée au format
              Factur-X et peut être transmise via la Plateforme Agréée.
            </p>
            <pre style={codeBlockStyle}>
              <code>{`curl -X POST https://app.invoquo.fr/api/v1/invoices \\
  -H "X-Api-Key: votre_cle_api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clientId": "cl_abc123",
    "date": "2026-03-29",
    "dueDate": "2026-04-28",
    "paymentTerms": "30_days",
    "operationCategory": "services",
    "lines": [
      {
        "description": "Rénovation salle de bain — main d\\u0027œuvre",
        "quantity": 3,
        "unitPriceHT": 450.00,
        "vatRate": 10.00,
        "unit": "jour"
      },
      {
        "description": "Fournitures sanitaires",
        "quantity": 1,
        "unitPriceHT": 820.00,
        "vatRate": 20.00,
        "unit": "lot"
      }
    ]
  }'`}</code>
            </pre>
          </section>

          {/* ── Intégration embed ── */}
          <section className="mb-12">
            <h2
              className="font-bold text-gray-900 mb-3"
              style={{ fontSize: 18 }}
            >
              Intégration embed
            </h2>
            <p
              className="text-gray-500 mb-5"
              style={{ fontSize: 14.5, lineHeight: 1.6 }}
            >
              Invoquo peut être intégré en marque blanche dans votre application
              via trois modes complémentaires.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* React SDK */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#166534",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    Recommandé
                  </span>
                  <h4
                    className="font-semibold text-gray-900"
                    style={{ fontSize: 15 }}
                  >
                    React SDK
                  </h4>
                </div>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                  Intégrez les composants de facturation directement dans votre
                  application React. Le SDK gère l&apos;authentification, le
                  theming et la communication avec l&apos;API Invoquo.
                </p>
              </div>

              {/* iframe */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <h4
                  className="font-semibold text-gray-900 mb-2"
                  style={{ fontSize: 15 }}
                >
                  iframe
                </h4>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                  Embarquez Invoquo dans une iframe avec un jeton embed (JWT
                  d&apos;une durée d&apos;une heure). Le theming s&apos;adapte
                  automatiquement aux couleurs de votre application via les
                  variables CSS. La communication parent-iframe utilise
                  postMessage.
                </p>
              </div>

              {/* API REST */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <h4
                  className="font-semibold text-gray-900 mb-2"
                  style={{ fontSize: 15 }}
                >
                  API REST headless
                </h4>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                  Utilisez l&apos;API REST pour récupérer les données (compteurs,
                  badges, notifications) et construire votre propre interface.
                  Idéal pour afficher un résumé de facturation dans le tableau de
                  bord de votre application.
                </p>
              </div>
            </div>
          </section>

          {/* ── Limites et format ── */}
          <section className="mb-14">
            <h2
              className="font-bold text-gray-900 mb-3"
              style={{ fontSize: 18 }}
            >
              Limites et format
            </h2>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: "#374151",
                        width: "40%",
                      }}
                    >
                      Limite de débit
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>
                      100 requêtes par minute par clé API
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Format des réponses
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>
                      JSON (application/json)
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Encodage
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>UTF-8</td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Pagination
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>
                      <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                        ?page=1&limit=20
                      </code>{" "}
                      — réponse inclut total, page, totalPages
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: "#374151",
                        borderBottom: "none",
                      }}
                    >
                      Codes HTTP
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280", borderBottom: "none" }}>
                      200, 201, 400, 401, 403, 404, 422, 429, 500
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── CTA ── */}
          <section>
            <div
              style={{
                background: "#faf8ff",
                border: "1px solid #e9e0fc",
                borderRadius: 14,
                padding: "32px 28px",
                textAlign: "center",
              }}
            >
              <h3
                className="font-semibold text-gray-900"
                style={{ fontSize: 17, marginBottom: 8 }}
              >
                Prêt à intégrer Invoquo ?
              </h3>
              <p
                className="text-gray-500"
                style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}
              >
                Créez votre compte gratuitement et générez votre clé API en
                quelques minutes. Besoin d&apos;aide ? Contactez-nous à{" "}
                <strong>support@invoquo.fr</strong>.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  href="/signup"
                  style={{
                    display: "inline-block",
                    background: "#7c3aed",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 24px",
                    borderRadius: 8,
                    textDecoration: "none",
                  }}
                >
                  Créer un compte
                </Link>
                <Link
                  href="/aide"
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: "#7c3aed",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 24px",
                    borderRadius: 8,
                    textDecoration: "none",
                    border: "1px solid #e9e0fc",
                  }}
                >
                  Centre d&apos;aide
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
