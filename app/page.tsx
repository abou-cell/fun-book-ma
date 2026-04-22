import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { CategoriesSection } from "@/features/home/components/CategoriesSection";
import { HeroSection } from "@/features/home/components/HeroSection";
import { PopularActivitiesSection } from "@/features/home/components/PopularActivitiesSection";
import { categories, popularActivities } from "@/features/home/data";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
      <HeroSection />
      <CategoriesSection categories={categories} />
      <PopularActivitiesSection activities={popularActivities} />
    </NavbarPageLayout>
  );
}
