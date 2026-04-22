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
export const CATALOG_DEFAULT_SORT: SortOption = "popular";

export const catalogQueryParamKeys = {
  q: "q",
  city: "city",
  category: "category",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  duration: "duration",
  rating: "rating",
  sort: "sort",
} as const;

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
  const getTrimmed = (key: string) => get(key)?.trim() || undefined;
  const getPositiveNumber = (key: string) => {
    const parsed = Number(get(key));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };

  const categoryParam = get(catalogQueryParamKeys.category);
  const normalizedCategory = categoryParam?.toUpperCase() as ActivityCategory | undefined;
  const category = normalizedCategory && Object.values(ActivityCategory).includes(normalizedCategory) ? normalizedCategory : undefined;

  const sortParam = get(catalogQueryParamKeys.sort);
  const sort = sortParam && sortParam in sortOptions ? (sortParam as SortOption) : CATALOG_DEFAULT_SORT;

  const minPrice = getPositiveNumber(catalogQueryParamKeys.minPrice);
  const maxPrice = getPositiveNumber(catalogQueryParamKeys.maxPrice);
  const [normalizedMinPrice, normalizedMaxPrice] =
    minPrice && maxPrice && minPrice > maxPrice ? [maxPrice, minPrice] : [minPrice, maxPrice];

  return {
    q: getTrimmed(catalogQueryParamKeys.q),
    city: getTrimmed(catalogQueryParamKeys.city),
    category,
    minPrice: normalizedMinPrice,
    maxPrice: normalizedMaxPrice,
    duration: getTrimmed(catalogQueryParamKeys.duration),
    minRating: getPositiveNumber(catalogQueryParamKeys.rating),
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
  const where = buildActivityWhere(filters);
  const orderBy = getActivityOrderBy(filters.sort);

  return prisma.activity.findMany({
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      city: true,
      category: true,
      price: true,
      coverImage: true,
      slug: true,
      rating: true,
      reviewCount: true,
      duration: true,
      shortDescription: true,
    },
  });
}

function buildActivityWhere(filters: CatalogFilters): Prisma.ActivityWhereInput {
  return {
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
}

function getActivityOrderBy(sort: SortOption | undefined): Prisma.ActivityOrderByWithRelationInput[] {
  if (sort === "priceAsc") {
    return [{ price: "asc" }];
  }

  if (sort === "priceDesc") {
    return [{ price: "desc" }];
  }

  if (sort === "rating") {
    return [{ rating: "desc" }, { reviewCount: "desc" }];
  }

  if (sort === "newest") {
    return [{ createdAt: "desc" }];
  }

  return [{ reviewCount: "desc" }, { rating: "desc" }];
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
