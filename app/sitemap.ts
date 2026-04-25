import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/stories`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE.url}/city/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: c.status === "live" ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...cityRoutes];
}
