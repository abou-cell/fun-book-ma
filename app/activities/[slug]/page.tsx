import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/SectionHeader";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { activityCategoryLabels, getActivityBySlug } from "@/features/activities/catalog";

type ActivityDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ActivityDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    return {
      title: "Activity not found | FunBook",
      description: "The requested activity could not be found.",
    };
  }

  return {
    title: `${activity.title} | FunBook Morocco`,
    description: activity.shortDescription,
  };
}

export default async function ActivityDetailsPage({ params }: ActivityDetailsPageProps) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  const gallery = activity.images.length > 0 ? activity.images : [{ imageUrl: activity.coverImage, altText: activity.title, id: activity.id }];

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader title={activity.title} subtitle={activity.shortDescription} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {gallery.map((image, index) => (
              <div key={`${image.id}-${index}`} className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 sm:h-64">
                <Image
                  src={image.imageUrl}
                  alt={image.altText ?? activity.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">About this activity</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{activity.description}</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-900">City:</span> {activity.city}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Category:</span> {activityCategoryLabels[activity.category]}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Duration:</span> {activity.duration}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Provider:</span> {activity.provider.businessName}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-2xl font-semibold text-slate-900">{Number(activity.price).toFixed(0)} MAD</p>
            <p className="mt-1 text-sm text-slate-600">per person</p>
            <p className="mt-3 text-sm text-slate-700">
              ⭐ {Number(activity.rating).toFixed(1)} ({activity.reviewCount} reviews)
            </p>
            <button className="mt-5 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">
              Book now
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-slate-900">Availability</h3>
            <p className="mt-2 text-sm text-slate-600">
              Availability calendar and slot selection will appear here in the upcoming booking flow.
            </p>
          </div>
        </aside>
      </div>
    </NavbarPageLayout>
  );
}
