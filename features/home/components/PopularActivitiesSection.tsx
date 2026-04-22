import { ActivityCard, type ActivityCardProps } from "@/components/ActivityCard";
import { SectionHeader } from "@/components/SectionHeader";

type PopularActivitiesSectionProps = {
  activities: ActivityCardProps[];
};

export function PopularActivitiesSection({ activities }: PopularActivitiesSectionProps) {
  return (
    <section id="popular" className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      <SectionHeader title="Popular Activities" ctaLabel="Explore more" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.title} {...activity} />
        ))}
      </div>
    </section>
  );
}
