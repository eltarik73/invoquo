import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://invoquo.vercel.app"),
  title: {
    default: "Invoquo — Facturation Electronique Conforme 2026 | Plateforme Agreee",
    template: "%s | Invoquo — Facturation Electronique",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Invoquo",
  },
  formatDetection: {
    telephone: false,
  },
  description:
    "Logiciel de facturation electronique connecte Plateforme Agreee DGFiP. Recevez et emettez vos factures conformes sept. 2026. TPE, artisans, auto-entrepreneurs. 1 mois gratuit.",
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
    "logiciel facturation conforme DGFiP",
    "logiciel facturation plombier",
    "logiciel facturation electricien",
    "e-invoicing France",
    "facturation electronique micro entreprise",
    "logiciel facturation conforme 2026",
    "recevoir factures electroniques",
    "sanctions facturation electronique",
  ],
  authors: [{ name: "Invoquo" }],
  creator: "Invoquo",
  publisher: "Invoquo",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Invoquo",
    title: "Invoquo — Facturation Electronique Conforme 2026 | Plateforme Agreee",
    description:
      "Connecte Plateforme Agreee DGFiP. Recevez vos factures electroniques conformes. 1 mois gratuit pour TPE et artisans.",
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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
