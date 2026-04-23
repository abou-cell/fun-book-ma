import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/activities", "/activities/*", "/sitemap.xml"],
      disallow: ["/admin", "/provider", "/api", "/checkout", "/bookings"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
