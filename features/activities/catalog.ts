import { createHash } from "node:crypto";
import { ActivityCategory, Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

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

export type CatalogQueryParamKey = (typeof catalogQueryParamKeys)[keyof typeof catalogQueryParamKeys];

export type CatalogFilters = {
  q?: string;
  city?: string;
  category?: ActivityCategory;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  minRating?: number;
  sort: SortOption;
};

type SearchParamMap = Record<string, string | string[] | undefined>;

function getSearchParam(searchParams: SearchParamMap, key: CatalogQueryParamKey) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function getTrimmedSearchParam(searchParams: SearchParamMap, key: CatalogQueryParamKey) {
  const value = getSearchParam(searchParams, key)?.trim();
  return value ? value : undefined;
}

function getPositiveNumberSearchParam(searchParams: SearchParamMap, key: CatalogQueryParamKey) {
  const value = Number(getSearchParam(searchParams, key));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function isActivityCategory(value: string): value is ActivityCategory {
  return Object.values(ActivityCategory).includes(value as ActivityCategory);
}

function isSortOption(value: string): value is SortOption {
  return value in sortOptions;
}

export function parseCatalogFilters(searchParams: SearchParamMap): CatalogFilters {
  const minPrice = getPositiveNumberSearchParam(searchParams, catalogQueryParamKeys.minPrice);
  const maxPrice = getPositiveNumberSearchParam(searchParams, catalogQueryParamKeys.maxPrice);

  const categoryParam = getSearchParam(searchParams, catalogQueryParamKeys.category);
  const normalizedCategory = categoryParam?.toUpperCase();
  const category = normalizedCategory && isActivityCategory(normalizedCategory) ? normalizedCategory : undefined;

  const sortParam = getSearchParam(searchParams, catalogQueryParamKeys.sort);
  const sort = sortParam && isSortOption(sortParam) ? sortParam : CATALOG_DEFAULT_SORT;

  const [normalizedMinPrice, normalizedMaxPrice] = minPrice && maxPrice && minPrice > maxPrice ? [maxPrice, minPrice] : [minPrice, maxPrice];

  const minRating = getPositiveNumberSearchParam(searchParams, catalogQueryParamKeys.rating);

  return {
    q: getTrimmedSearchParam(searchParams, catalogQueryParamKeys.q),
    city: getTrimmedSearchParam(searchParams, catalogQueryParamKeys.city),
    category,
    minPrice: normalizedMinPrice,
    maxPrice: normalizedMaxPrice,
    duration: getTrimmedSearchParam(searchParams, catalogQueryParamKeys.duration),
    minRating: minRating && minRating <= 5 ? minRating : undefined,
    sort,
  };
}

const getCachedCatalogFilterData = unstable_cache(
  async () => {
    const [cities, durations] = await Promise.all([
      prisma.activity.findMany({
        where: { isActive: true, status: "APPROVED" },
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      }),
      prisma.activity.findMany({
        where: { isActive: true, status: "APPROVED" },
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
  },
  ["catalog-filter-data"],
  { revalidate: 60 * 60 },
);

export async function getCatalogFilterData() {
  return getCachedCatalogFilterData();
}

function getCatalogCacheKey(filters: CatalogFilters) {
  return createHash("sha1").update(JSON.stringify(filters)).digest("hex");
}

async function fetchActivities(filters: CatalogFilters) {
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

export async function getActivities(filters: CatalogFilters) {
  const cacheKey = getCatalogCacheKey(filters);
  const getCachedActivities = unstable_cache(async () => fetchActivities(filters), ["catalog-activities", cacheKey], { revalidate: 300 });
  return getCachedActivities();
}

function buildActivityWhere(filters: CatalogFilters): Prisma.ActivityWhereInput {
  const searchQuery = filters.q
    ? {
        OR: [
          { title: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
          { shortDescription: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const priceRange = filters.minPrice || filters.maxPrice
    ? {
        price: {
          ...(filters.minPrice ? { gte: filters.minPrice } : {}),
          ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
        },
      }
    : {};

  return {
    isActive: true,
    status: "APPROVED",
    ...searchQuery,
    ...(filters.city ? { city: { equals: filters.city, mode: Prisma.QueryMode.insensitive } } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.duration ? { duration: filters.duration } : {}),
    ...(filters.minRating ? { rating: { gte: filters.minRating } } : {}),
    ...priceRange,
  };
}

function getActivityOrderBy(sort: SortOption): Prisma.ActivityOrderByWithRelationInput[] {
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

async function fetchActivityBySlug(slug: string) {
  return prisma.activity.findFirst({
    where: { slug, isActive: true, status: "APPROVED" },
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

export async function getActivityBySlug(slug: string) {
  const getCachedActivityBySlug = unstable_cache(async () => fetchActivityBySlug(slug), ["activity-slug", slug], { revalidate: 300 });
  return getCachedActivityBySlug();
}
