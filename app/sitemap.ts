import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { SITE } from "@/lib/seo";
import { loadStories } from "@/lib/stories";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/stories`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE.url}/city/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: c.status === "live" ? 0.9 : 0.7,
  }));

  const stories = await loadStories();
  const storyRoutes: MetadataRoute.Sitemap = stories.map((s) => ({
    url: `${SITE.url}/stories/${s.id}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...cityRoutes, ...storyRoutes];
}
