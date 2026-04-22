import { SectionHeader } from "@/components/SectionHeader";

type CategoriesSectionProps = {
  categories: string[];
};

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section id="categories" className="mt-12">
      <SectionHeader title="Top Categories" ctaLabel="View all" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <button
            key={category}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-brand/30 hover:text-brand"
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}
