import { catalogQueryParamKeys, sortOptions, type SortOption } from "@/features/activities/catalog";

type SortDropdownProps = {
  value: SortOption;
};

export function SortDropdown({ value }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-slate-700">
        Sort
      </label>
      <select
        id={catalogQueryParamKeys.sort}
        name={catalogQueryParamKeys.sort}
        defaultValue={value}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
      >
        {Object.entries(sortOptions).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
