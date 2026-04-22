import { SearchBar } from "@/components/SearchBar";

export function HeroSection() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand/10 via-white to-cyan-100 p-8 md:p-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Discover Morocco</p>
      <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Find and book unique activities all across Morocco.
      </h1>
      <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
        Browse trusted local providers and reserve unforgettable experiences in minutes.
      </p>
      <SearchBar />
    </div>
  );
}
