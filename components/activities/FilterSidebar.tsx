import { ActivityCategory } from "@prisma/client";

import { activityCategoryLabels, type CatalogFilters } from "@/features/activities/catalog";

type FilterSidebarProps = {
  filters: CatalogFilters;
  cities: string[];
  durations: string[];
  categories: ActivityCategory[];
};

export function FilterSidebar({ filters, cities, durations, categories }: FilterSidebarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Filters</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="q" className="text-sm font-medium text-slate-700">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="Search activities"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="city" className="text-sm font-medium text-slate-700">
            City
          </label>
          <select id="city" name="city" defaultValue={filters.city ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {activityCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="minPrice" className="text-sm font-medium text-slate-700">
              Min price
            </label>
            <input id="minPrice" name="minPrice" type="number" min={0} defaultValue={filters.minPrice} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="maxPrice" className="text-sm font-medium text-slate-700">
              Max price
            </label>
            <input id="maxPrice" name="maxPrice" type="number" min={0} defaultValue={filters.maxPrice} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="text-sm font-medium text-slate-700">
            Duration
          </label>
          <select id="duration" name="duration" defaultValue={filters.duration ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Any duration</option>
            {durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rating" className="text-sm font-medium text-slate-700">
            Minimum rating
          </label>
          <select id="rating" name="rating" defaultValue={filters.minRating ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All ratings</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </select>
        </div>

        <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Apply filters
        </button>
      </div>
    </div>
  );
}
