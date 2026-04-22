import { ActivityCategory, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  ADVENTURE: "Adventure",
  SURF: "Surf",
  WELLNESS: "Wellness",
  KIDS: "Kids",
  CULTURE: "Culture",
  NATURE: "Nature",
};

export const sortOptions = {
  popular: "Most popular",
  priceAsc: "Price low to high",
  priceDesc: "Price high to low",
  rating: "Highest rated",
  newest: "Newest",
} as const;

export type SortOption = keyof typeof sortOptions;

export type CatalogFilters = {
  q?: string;
  city?: string;
  category?: ActivityCategory;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  minRating?: number;
  sort?: SortOption;
};

export function parseCatalogFilters(searchParams: Record<string, string | string[] | undefined>): CatalogFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const categoryParam = get("category");
  const normalizedCategory = categoryParam?.toUpperCase() as ActivityCategory | undefined;
  const category = normalizedCategory && Object.values(ActivityCategory).includes(normalizedCategory) ? normalizedCategory : undefined;

  const sortParam = get("sort");
  const sort = sortParam && sortParam in sortOptions ? (sortParam as SortOption) : "popular";

  const minPrice = Number(get("minPrice"));
  const maxPrice = Number(get("maxPrice"));
  const minRating = Number(get("rating"));

  return {
    q: get("q")?.trim() || undefined,
    city: get("city")?.trim() || undefined,
    category,
    minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
    duration: get("duration")?.trim() || undefined,
    minRating: Number.isFinite(minRating) && minRating > 0 ? minRating : undefined,
    sort,
  };
}

export async function getCatalogFilterData() {
  const [cities, durations] = await Promise.all([
    prisma.activity.findMany({
      where: { isActive: true },
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    }),
    prisma.activity.findMany({
      where: { isActive: true },
      distinct: ["duration"],
      select: { duration: true },
      orderBy: { duration: "asc" },
    }),
  ]);

  return {
    cities: cities.map((item) => item.city),
    durations: durations.map((item) => item.duration),
    categories: Object.values(ActivityCategory),
  };
}

export async function getActivities(filters: CatalogFilters) {
  const where: Prisma.ActivityWhereInput = {
    isActive: true,
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { shortDescription: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.city ? { city: { equals: filters.city, mode: "insensitive" } } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.duration ? { duration: filters.duration } : {}),
    ...(filters.minRating ? { rating: { gte: filters.minRating } } : {}),
    ...((filters.minPrice || filters.maxPrice)
      ? {
          price: {
            ...(filters.minPrice ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ActivityOrderByWithRelationInput[] =
    filters.sort === "priceAsc"
      ? [{ price: "asc" }]
      : filters.sort === "priceDesc"
        ? [{ price: "desc" }]
        : filters.sort === "rating"
          ? [{ rating: "desc" }, { reviewCount: "desc" }]
          : filters.sort === "newest"
            ? [{ createdAt: "desc" }]
            : [{ reviewCount: "desc" }, { rating: "desc" }];

  return prisma.activity.findMany({
    where,
    orderBy,
    include: {
      provider: {
        select: { businessName: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 4,
      },
    },
  });
}

export async function getActivityBySlug(slug: string) {
  return prisma.activity.findFirst({
    where: { slug, isActive: true },
    include: {
      provider: {
        select: {
          businessName: true,
          city: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
