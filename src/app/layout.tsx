import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://invoquo.vercel.app"),
  title: {
    default: "Invoquo — Facturation electronique conforme 2026 pour artisans et TPE",
    template: "%s | Invoquo",
  },
  description:
    "Logiciel de facturation electronique conforme a la reforme septembre 2026. Plateforme Agreee, Factur-X, devis, factures, e-reporting. 1 mois gratuit pour artisans, auto-entrepreneurs et TPE.",
  keywords: [
    "facturation electronique",
    "facturation electronique obligatoire 2026",
    "logiciel facturation artisan",
    "logiciel facturation auto entrepreneur",
    "plateforme agreee",
    "facture electronique TPE",
    "logiciel devis facture",
    "Factur-X",
    "e-reporting",
    "reforme facturation 2026",
    "logiciel facturation BTP",
    "facture conforme",
    "logiciel facturation en ligne",
    "facturation electronique auto entrepreneur",
    "obligation facturation electronique",
    "logiciel facturation gratuit",
    "devis facture artisan",
    "plateforme de dematerialisation partenaire",
  ],
  authors: [{ name: "Invoquo" }],
  creator: "Invoquo",
  publisher: "Invoquo",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Invoquo",
    title: "Invoquo — Facturation electronique conforme 2026",
    description:
      "Factures conformes a la reforme 2026. Plateforme Agreee, Factur-X, devis et e-reporting. Simple, conforme, pour artisans et TPE.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invoquo — Facturation electronique conforme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoquo — Facturation electronique conforme 2026",
    description:
      "Factures conformes a la reforme 2026 pour artisans et TPE. Plateforme Agreee, Factur-X. 1 mois gratuit.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://invoquo.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Invoquo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Logiciel de facturation electronique conforme a la reforme septembre 2026. Connecte a une Plateforme Agreee certifiee par l'Etat.",
    offers: [
      {
        "@type": "Offer",
        name: "Essentiel",
        price: "19",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "19",
          priceCurrency: "EUR",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Standard",
        price: "39",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "39",
          priceCurrency: "EUR",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "59",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "59",
          priceCurrency: "EUR",
          unitText: "MONTH",
        },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
    },
    featureList: [
      "Facturation electronique conforme reforme 2026",
      "Connexion Plateforme Agreee certifiee",
      "Format Factur-X",
      "Creation factures et devis",
      "E-reporting automatique",
      "Export comptable FEC",
      "Securisation et archivage 7 ans",
    ],
  };

  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
