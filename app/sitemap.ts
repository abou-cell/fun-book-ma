import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/metadata";

export const revalidate = 60 * 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const generatedAt = new Date();

  const activities = await prisma.activity.findMany({
    where: {
      isActive: true,
      status: "APPROVED",
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return [
    {
      url: `${siteUrl}/`,
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/activities`,
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...activities.map((activity) => ({
      url: `${siteUrl}/activities/${activity.slug}`,
      lastModified: activity.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
