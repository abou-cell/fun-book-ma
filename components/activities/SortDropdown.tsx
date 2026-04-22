import { catalogQueryParamKeys, sortOptions, type SortOption } from "@/features/activities/catalog";

import { FilterSelect } from "./FilterControls";

type SortDropdownProps = {
  value: SortOption;
};

export function SortDropdown({ value }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={catalogQueryParamKeys.sort} className="text-sm font-medium text-slate-700">
        Sort
      </label>
      <FilterSelect id={catalogQueryParamKeys.sort} name={catalogQueryParamKeys.sort} defaultValue={value}>
        {Object.entries(sortOptions).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </FilterSelect>
    </div>
  );
}
