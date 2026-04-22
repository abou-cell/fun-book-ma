import { ActivityCategory } from "@prisma/client";

import { activityCategoryLabels, catalogQueryParamKeys, type CatalogFilters } from "@/features/activities/catalog";

import { FilterField, FilterInput, FilterSelect } from "./FilterControls";

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
        <FilterField htmlFor={catalogQueryParamKeys.q} label="Search">
          <FilterInput
            id={catalogQueryParamKeys.q}
            name={catalogQueryParamKeys.q}
            defaultValue={filters.q}
            placeholder="Search activities"
            autoComplete="off"
          />
        </FilterField>

        <FilterField htmlFor={catalogQueryParamKeys.city} label="City">
          <FilterSelect id={catalogQueryParamKeys.city} name={catalogQueryParamKeys.city} defaultValue={filters.city ?? ""}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField htmlFor={catalogQueryParamKeys.category} label="Category">
          <FilterSelect id={catalogQueryParamKeys.category} name={catalogQueryParamKeys.category} defaultValue={filters.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {activityCategoryLabels[category]}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <div className="grid grid-cols-2 gap-2">
          <FilterField htmlFor={catalogQueryParamKeys.minPrice} label="Min price">
            <FilterInput
              id={catalogQueryParamKeys.minPrice}
              name={catalogQueryParamKeys.minPrice}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={filters.minPrice}
            />
          </FilterField>
          <FilterField htmlFor={catalogQueryParamKeys.maxPrice} label="Max price">
            <FilterInput
              id={catalogQueryParamKeys.maxPrice}
              name={catalogQueryParamKeys.maxPrice}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={filters.maxPrice}
            />
          </FilterField>
        </div>

        <FilterField htmlFor={catalogQueryParamKeys.duration} label="Duration">
          <FilterSelect id={catalogQueryParamKeys.duration} name={catalogQueryParamKeys.duration} defaultValue={filters.duration ?? ""}>
            <option value="">Any duration</option>
            {durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField htmlFor={catalogQueryParamKeys.rating} label="Minimum rating">
          <FilterSelect id={catalogQueryParamKeys.rating} name={catalogQueryParamKeys.rating} defaultValue={filters.minRating ?? ""}>
            <option value="">All ratings</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </FilterSelect>
        </FilterField>

        <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Apply filters
        </button>
      </div>
    </div>
  );
}
