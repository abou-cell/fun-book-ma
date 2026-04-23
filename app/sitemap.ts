import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/metadata";

export const revalidate = 60 * 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const generatedAt = new Date();

  const activities = await prisma.activity.findMany({
    where: { isActive: true, status: "APPROVED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const localizedStatic = locales.flatMap((locale) => ([
    { url: `${siteUrl}/${locale}`, lastModified: generatedAt, changeFrequency: "daily" as const, priority: 1 },
    { url: `${siteUrl}/${locale}/activities`, lastModified: generatedAt, changeFrequency: "daily" as const, priority: 0.9 },
  ]));

  const localizedActivities = locales.flatMap((locale) => activities.map((activity) => ({
    url: `${siteUrl}/${locale}/activities/${activity.slug}`,
    lastModified: activity.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  })));

  return [...localizedStatic, ...localizedActivities];
}
