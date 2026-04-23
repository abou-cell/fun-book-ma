import { notFound } from "next/navigation";

import { ActivityModerationActions } from "@/components/admin/ActivityModerationActions";
import { ModerationStatusBadge } from "@/components/admin/ModerationStatusBadge";
import { updateActivityStatusAction } from "@/lib/admin/actions";
import { getActivityDetail } from "@/lib/admin/service";

export default async function AdminActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivityDetail(id);
  if (!activity) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">{activity.title}</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3"><ModerationStatusBadge status={activity.status} /><p className="text-sm text-slate-500">Provider: {activity.provider.businessName}</p></div>
        <p className="mt-2 text-sm text-slate-600">{activity.description}</p>
        <p className="text-sm text-slate-500">City: {activity.city} · Category: {activity.category}</p>
        <p className="text-sm text-slate-500">Schedules: {activity._count.schedules} · Bookings: {activity._count.bookings}</p>
        <p className="text-sm text-slate-500">Rating: {Number(activity.rating).toFixed(1)} ({activity.reviewCount} reviews)</p>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {activity.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.id} src={image.imageUrl} alt={image.altText ?? activity.title} className="h-36 w-full rounded-lg object-cover" />
          ))}
        </div>

        <div className="mt-4"><ActivityModerationActions id={activity.id} status={activity.status} action={updateActivityStatusAction} /></div>
      </div>
    </div>
  );
}
