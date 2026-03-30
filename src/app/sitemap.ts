import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://invoquo.vercel.app";
  const now = new Date();

  const artisans = [
    "plombier", "electricien", "peintre", "macon",
    "menuisier", "couvreur", "chauffagiste", "carreleur",
  ];

  return [
    // Core pages
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },

    // Landing pages (high priority)
    { url: `${baseUrl}/facturation-electronique-2026`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/plateforme-agreee`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/logiciel-facturation-artisan`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/logiciel-facturation-auto-entrepreneur`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/conformite`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },

    // Guides
    { url: `${baseUrl}/guide/factur-x`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide/mentions-obligatoires-facture`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide/sanctions-facturation-electronique`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide/calendrier-facturation-electronique`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide/choisir-plateforme-agreee`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide/e-reporting-tva`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },

    // Metiers (8 artisans)
    ...artisans.map((m) => ({
      url: `${baseUrl}/metiers/${m}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
