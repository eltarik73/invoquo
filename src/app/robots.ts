import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/embed/", "/api/"],
      },
    ],
    sitemap: "https://invoquo.vercel.app/sitemap.xml",
  };
}
