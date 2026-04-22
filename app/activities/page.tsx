import type { Metadata } from "next";

import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/activities/EmptyState";
import { FilterSidebar } from "@/components/activities/FilterSidebar";
import { SortDropdown } from "@/components/activities/SortDropdown";
import { SectionHeader } from "@/components/SectionHeader";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import {
  CATALOG_DEFAULT_SORT,
  activityCategoryLabels,
  getActivities,
  getCatalogFilterData,
  parseCatalogFilters,
} from "@/features/activities/catalog";

export const metadata: Metadata = {
  title: "Activities in Morocco | FunBook Marketplace",
  description: "Browse and book top-rated activities across Morocco with smart filters and sorting.",
};

type ActivitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseCatalogFilters(resolvedSearchParams);

  const [activities, filterData] = await Promise.all([getActivities(filters), getCatalogFilterData()]);

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
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
              <SortDropdown value={filters.sort ?? CATALOG_DEFAULT_SORT} />
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
                  href={`/activities/${activity.slug}`}
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
