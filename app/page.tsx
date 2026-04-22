import { Navbar } from "@/components/Navbar";
import { CategoriesSection } from "@/features/home/components/CategoriesSection";
import { HeroSection } from "@/features/home/components/HeroSection";
import { PopularActivitiesSection } from "@/features/home/components/PopularActivitiesSection";
import { categories, popularActivities } from "@/features/home/data";

export default function HomePage() {
  return (
    <main className="min-h-screen pb-16">
      <Navbar />
      <HeroSection />
      <CategoriesSection categories={categories} />
      <PopularActivitiesSection activities={popularActivities} />
    </main>
  );
}
