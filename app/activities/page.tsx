import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/activities/EmptyState";
import { FilterSidebar } from "@/components/activities/FilterSidebar";
import { SortDropdown } from "@/components/activities/SortDropdown";
import { SectionHeader } from "@/components/SectionHeader";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import {
  activityCategoryLabels,
  getActivities,
  getCatalogFilterData,
  parseCatalogFilters,
} from "@/features/activities/catalog";

import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";
import { buildActivitiesItemListSchema, buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export const revalidate = 300;

export const metadata = buildPageMetadata({
  title: "Activities in Morocco",
  description: "Browse and book top-rated activities across Morocco with smart filters and sorting.",
  path: "/activities",
  keywords: ["activities in Morocco", "Morocco tours", "book activities"],
});

type ActivitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const locale = await getRequestLocale();
  const resolvedSearchParams = await searchParams;
  const filters = parseCatalogFilters(resolvedSearchParams);

  const [activities, filterData] = await Promise.all([getActivities(filters), getCatalogFilterData()]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Activities", path: "/activities" },
  ]);
  const activitiesListSchema = buildActivitiesItemListSchema(
    activities.slice(0, 24).map((activity) => ({
      title: activity.title,
      slug: activity.slug,
      image: activity.coverImage,
      price: Number(activity.price),
    })),
  );

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd id="activities-breadcrumb-schema" data={breadcrumbSchema} />
      <JsonLd id="activities-itemlist-schema" data={activitiesListSchema} />
      <SectionHeader title="Explore activities" subtitle="Discover unforgettable experiences across Morocco." />

      <form method="GET" className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <FilterSidebar filters={filters} cities={filterData.cities} durations={filterData.durations} categories={filterData.categories} />
        </aside>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{activities.length}</span> activities
            </p>
            <div className="flex items-center gap-2">
              <SortDropdown value={filters.sort} />
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Update
              </button>
            </div>
          </div>

          {activities.length === 0 ? (
            <EmptyState title="No activities found" description="Try adjusting your filters or search terms to discover more experiences." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  city={activity.city}
                  category={activityCategoryLabels[activity.category]}
                  price={Number(activity.price)}
                  image={activity.coverImage}
                  href={`/${locale}/activities/${activity.slug}`}
                  rating={Number(activity.rating)}
                  reviewCount={activity.reviewCount}
                  duration={activity.duration}
                  shortDescription={activity.shortDescription}
                />
              ))}
            </div>
          )}
        </section>
      </form>
    </NavbarPageLayout>
  );
}
