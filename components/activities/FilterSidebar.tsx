import { ActivityCategory } from "@prisma/client";
import type { ReactNode } from "react";

import { activityCategoryLabels, catalogQueryParamKeys, type CatalogFilters } from "@/features/activities/catalog";

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
          <input
            id={catalogQueryParamKeys.q}
            name={catalogQueryParamKeys.q}
            defaultValue={filters.q}
            placeholder="Search activities"
            autoComplete="off"
            className={inputClassName}
          />
        </FilterField>

        <FilterField htmlFor={catalogQueryParamKeys.city} label="City">
          <select id={catalogQueryParamKeys.city} name={catalogQueryParamKeys.city} defaultValue={filters.city ?? ""} className={inputClassName}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField htmlFor={catalogQueryParamKeys.category} label="Category">
          <select id={catalogQueryParamKeys.category} name={catalogQueryParamKeys.category} defaultValue={filters.category ?? ""} className={inputClassName}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {activityCategoryLabels[category]}
              </option>
            ))}
          </select>
        </FilterField>

        <div className="grid grid-cols-2 gap-2">
          <FilterField htmlFor={catalogQueryParamKeys.minPrice} label="Min price">
            <input
              id={catalogQueryParamKeys.minPrice}
              name={catalogQueryParamKeys.minPrice}
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={filters.minPrice}
              className={inputClassName}
            />
          </FilterField>
          <FilterField htmlFor={catalogQueryParamKeys.maxPrice} label="Max price">
            <input
              id={catalogQueryParamKeys.maxPrice}
              name={catalogQueryParamKeys.maxPrice}
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={filters.maxPrice}
              className={inputClassName}
            />
          </FilterField>
        </div>

        <FilterField htmlFor={catalogQueryParamKeys.duration} label="Duration">
          <select id={catalogQueryParamKeys.duration} name={catalogQueryParamKeys.duration} defaultValue={filters.duration ?? ""} className={inputClassName}>
            <option value="">Any duration</option>
            {durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField htmlFor={catalogQueryParamKeys.rating} label="Minimum rating">
          <select id={catalogQueryParamKeys.rating} name={catalogQueryParamKeys.rating} defaultValue={filters.minRating ?? ""} className={inputClassName}>
            <option value="">All ratings</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </select>
        </FilterField>

        <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Apply filters
        </button>
      </div>
    </div>
  );
}

type FilterFieldProps = {
  htmlFor: string;
  label: string;
  children: ReactNode;
};

function FilterField({ htmlFor, label, children }: FilterFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputClassName = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
