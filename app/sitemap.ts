import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/metadata";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const generatedAt = new Date();

  const localizedStatic = locales.flatMap((locale) => ([
    { url: `${siteUrl}/${locale}`, lastModified: generatedAt, changeFrequency: "daily" as const, priority: 1 },
    { url: `${siteUrl}/${locale}/activities`, lastModified: generatedAt, changeFrequency: "daily" as const, priority: 0.9 },
  ]));

  try {
    const activities = await prisma.activity.findMany({
      where: { isActive: true, status: "APPROVED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const localizedActivities = locales.flatMap((locale) => activities.map((activity) => ({
      url: `${siteUrl}/${locale}/activities/${activity.slug}`,
      lastModified: activity.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })));

    return [...localizedStatic, ...localizedActivities];
  } catch (error) {
    logger.warn("Sitemap generated without activity URLs", {
      error: error instanceof Error ? error.message : String(error),
    });

    return localizedStatic;
  }
}
