import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { BookingSection } from "@/components/booking/BookingSection";
import { SectionHeader } from "@/components/SectionHeader";
import { WhatsAppContactCard } from "@/components/whatsapp/WhatsAppContactCard";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { activityCategoryLabels, getActivityBySlug, getPublicSchedulesForActivity } from "@/features/activities/catalog";
import { getCurrentUser } from "@/lib/auth/current-user";
import { validateReviewOwnership } from "@/lib/reviews/validation";
import { buildPageMetadata, toAbsoluteUrl } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";
import { buildActivityStructuredData, buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export const revalidate = 300;

type ActivityDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ActivityDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    return buildPageMetadata({
      title: "Activity not found",
      description: "The requested activity could not be found.",
      path: `/activities/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: activity.title,
    description: activity.shortDescription,
    path: `/activities/${activity.slug}`,
    keywords: [activity.city, activityCategoryLabels[activity.category], "book activity", "Morocco experiences"],
    images: [{ url: activity.coverImage, alt: activity.title }],
  });
}

export default async function ActivityDetailsPage({ params }: ActivityDetailsPageProps) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const [activity, currentUser] = await Promise.all([getActivityBySlug(slug), getCurrentUser()]);

  if (!activity) {
    notFound();
  }

  const [schedules, reviewOwnership] = await Promise.all([
    getPublicSchedulesForActivity(activity.id),
    currentUser
      ? validateReviewOwnership({
          userId: currentUser.id,
          activityId: activity.id,
        })
      : Promise.resolve({ canReview: false, bookingId: undefined, ownership: "no_confirmed_booking" as const }),
  ]);

  const bookingSchedules = schedules.map((schedule) => ({
    id: schedule.id,
    date: schedule.date.toISOString().slice(0, 10),
    startTime: schedule.startTime.toISOString(),
    endTime: schedule.endTime.toISOString(),
    availableSpots: schedule.availableSpots,
    price: Number(schedule.price),
  }));

  const gallery = activity.images.length > 0 ? activity.images : [{ imageUrl: activity.coverImage, altText: activity.title, id: activity.id }];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: `/${locale}` },
    { name: "Activities", path: `/${locale}/activities` },
    { name: activity.title, path: `/${locale}/activities/${activity.slug}` },
  ]);

  const activityStructuredData = buildActivityStructuredData({
    title: activity.title,
    description: activity.shortDescription,
    slug: activity.slug,
    imageUrls: gallery.map((image) => toAbsoluteUrl(image.imageUrl)),
    city: activity.city,
    duration: activity.duration,
    price: Number(activity.price),
    providerName: activity.provider.businessName,
    rating: Number(activity.rating),
    reviewCount: activity.reviewCount,
  });

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd id="activity-breadcrumb-schema" data={breadcrumbSchema} />
      <JsonLd id="activity-schema" data={activityStructuredData} />

      <SectionHeader title={activity.title} subtitle={activity.shortDescription} />
      <p className="sr-only">
        {reviewOwnership.canReview
          ? "Verified booking owner can submit a review."
          : reviewOwnership.ownership === "no_paid_booking"
            ? "Review submission requires a paid booking."
            : "Review submission requires a confirmed booking ownership."}
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
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
                  priority={index === 0}
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
          <WhatsAppContactCard
            phone={activity.provider.whatsapp}
            title="Questions about this activity?"
            message={`Bonjour, je souhaite plus de détails sur ${activity.title}.`}
            buttonLabel="Ask on WhatsApp"
          />
          <BookingSection
            activityId={activity.id}
            schedules={bookingSchedules}
            defaultCustomerName={currentUser?.name}
            defaultCustomerEmail={currentUser?.email}
          />
        </aside>
      </div>
    </NavbarPageLayout>
  );
}
