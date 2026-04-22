import { ActivityCard, type ActivityCardProps } from "@/components/ActivityCard";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";

const categories = ["Quad", "Surf", "Spa", "Kids", "Experiences"];

const popularActivities: ActivityCardProps[] = [
  {
    title: "Sunset Quad in Agafay Desert",
    city: "Marrakech",
    category: "Quad",
    price: 420,
    image:
      "https://images.unsplash.com/photo-1683020896201-d4f7fbf8af86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Surf Session at Taghazout Bay",
    city: "Taghazout",
    category: "Surf",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Traditional Hammam & Spa Ritual",
    city: "Fes",
    category: "Spa",
    price: 290,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Family Day at Atlas Adventure Park",
    city: "Ifrane",
    category: "Kids",
    price: 240,
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen pb-16">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
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
      </section>

      <section id="categories" className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
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

      <section id="popular" className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Popular Activities" ctaLabel="Explore more" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularActivities.map((activity) => (
            <ActivityCard key={activity.title} {...activity} />
          ))}
        </div>
      </section>
    </main>
  );
}
