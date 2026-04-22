import { Search } from "lucide-react";

type SearchField = {
  ariaLabel: string;
  placeholder: string;
  defaultValue?: string;
  type?: import("react").HTMLInputTypeAttribute;
};

const searchInputClassName =
  "rounded-xl border border-transparent px-4 py-3 text-sm outline-none ring-brand/30 transition focus:border-slate-200 focus:ring";

const searchFields: SearchField[] = [
  {
    ariaLabel: "City",
    placeholder: "Where in Morocco?",
    defaultValue: "Marrakech",
  },
  {
    ariaLabel: "Activity",
    placeholder: "What activity?",
  },
  {
    ariaLabel: "Date",
    placeholder: "Date",
    type: "date",
  },
];

export function SearchBar() {
  return (
    <form className="mt-8 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-card md:flex md:items-center">
      <div className="grid flex-1 gap-2 md:grid-cols-3">
        {searchFields.map((field) => (
          <input
            key={field.ariaLabel}
            aria-label={field.ariaLabel}
            className={searchInputClassName}
            defaultValue={field.defaultValue}
            placeholder={field.placeholder}
            type={field.type ?? "text"}
          />
        ))}
      </div>
      <button
        type="submit"
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-dark md:ml-2 md:mt-0 md:w-auto"
      >
        <Search size={16} />
        Search
      </button>
    </form>
  );
}
