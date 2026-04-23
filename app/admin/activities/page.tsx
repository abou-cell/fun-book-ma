import Link from "next/link";
import { ActivityCategory, ActivityModerationStatus } from "@prisma/client";

import { ActivityModerationActions } from "@/components/admin/ActivityModerationActions";
import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { ModerationStatusBadge } from "@/components/admin/ModerationStatusBadge";
import { updateActivityStatusAction } from "@/lib/admin/actions";
import { getActivities, getCityOptions, getProviderOptions, normalizeActivityStatus } from "@/lib/admin/service";

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; city?: string; category?: string; providerId?: string }>;
}) {
  const params = await searchParams;
  const providers = await getProviderOptions();
  const cities = await getCityOptions();
  const status = normalizeActivityStatus(params.status ?? "");
  const activities = await getActivities({ status, city: params.city, category: params.category, providerId: params.providerId });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Activity moderation</h1>
      <AdminTableFilters>
        <form className="md:col-span-3 grid gap-2 md:grid-cols-5">
          <select name="status" defaultValue={status ?? ""} className="rounded border border-slate-300 px-2 py-2 text-sm"><option value="">Any status</option>{Object.values(ActivityModerationStatus).map((item)=><option key={item} value={item}>{item}</option>)}</select>
          <select name="city" defaultValue={params.city ?? ""} className="rounded border border-slate-300 px-2 py-2 text-sm"><option value="">Any city</option>{cities.map((item)=><option key={item}>{item}</option>)}</select>
          <select name="category" defaultValue={params.category ?? ""} className="rounded border border-slate-300 px-2 py-2 text-sm"><option value="">Any category</option>{Object.values(ActivityCategory).map((item)=><option key={item}>{item}</option>)}</select>
          <select name="providerId" defaultValue={params.providerId ?? ""} className="rounded border border-slate-300 px-2 py-2 text-sm"><option value="">Any provider</option>{providers.map((item)=><option key={item.id} value={item.id}>{item.businessName}</option>)}</select>
          <button className="rounded bg-slate-900 px-2 py-2 text-sm text-white">Apply filters</button>
        </form>
      </AdminTableFilters>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3"><p className="font-medium">{activity.title}</p><p className="text-slate-500">{activity.city} · {activity.category}</p><p className="text-slate-500">{activity._count.schedules} schedules · {activity._count.bookings} bookings</p></td>
                <td className="px-4 py-3">{activity.provider.businessName}</td>
                <td className="px-4 py-3"><ModerationStatusBadge status={activity.status} /></td>
                <td className="px-4 py-3 space-y-2"><Link className="inline-block rounded border border-slate-300 px-2 py-1" href={`/admin/activities/${activity.id}`}>Details</Link><ActivityModerationActions id={activity.id} status={activity.status} action={updateActivityStatusAction} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
