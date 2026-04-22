import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <form className="mt-8 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-card md:flex md:items-center">
      <div className="grid flex-1 gap-2 md:grid-cols-3">
        <input
          className="rounded-xl border border-transparent px-4 py-3 text-sm outline-none ring-brand/30 transition focus:border-slate-200 focus:ring"
          placeholder="Where in Morocco?"
          defaultValue="Marrakech"
          aria-label="City"
        />
        <input
          className="rounded-xl border border-transparent px-4 py-3 text-sm outline-none ring-brand/30 transition focus:border-slate-200 focus:ring"
          placeholder="What activity?"
          aria-label="Activity"
        />
        <input
          className="rounded-xl border border-transparent px-4 py-3 text-sm outline-none ring-brand/30 transition focus:border-slate-200 focus:ring"
          placeholder="Date"
          aria-label="Date"
          type="date"
        />
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
