import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Invoquo — Facturation électronique conforme",
    short_name: "Invoquo",
    description:
      "Logiciel de facturation électronique conforme à la réforme 2026 pour artisans et TPE.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
