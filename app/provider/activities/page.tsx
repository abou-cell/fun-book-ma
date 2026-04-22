import Link from "next/link";
import { ActivityCategory } from "@prisma/client";

import { ActivityStatusBadge } from "@/components/provider/ActivityStatusBadge";
import { ProviderEmptyState } from "@/components/provider/ProviderEmptyState";
import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProviderByUserId } from "@/lib/provider/service";

export default async function ProviderActivitiesPage({ searchParams }: { searchParams: Promise<{ status?: string; city?: string; category?: string }> }) {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);
  if (!provider) return <ProviderEmptyState title="No provider profile" description="Your provider account is not configured yet." />;

  const filters = await searchParams;
  const where = {
    providerId: provider.id,
    ...(filters.status ? { isActive: filters.status === "active" } : {}),
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.category ? { category: filters.category as ActivityCategory } : {}),
  };

  const activities = await prisma.activity.findMany({ where, include: { _count: { select: { bookings: true } } }, orderBy: { updatedAt: "desc" } });

  return (
    <>
      <ProviderHeader title="Activities" description="Manage all your experiences, pricing, and publication status." />
      {activities.length === 0 ? <ProviderEmptyState title="No activities yet" description="Create your first activity listing to start receiving bookings." ctaHref="/provider/activities/new" ctaLabel="Create activity" /> : (
        <>
          <div className="space-y-3 md:hidden">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-slate-600">{activity.city} • {activity.category}</p>
                  </div>
                  <ActivityStatusBadge isActive={activity.isActive} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>Price: {formatCurrencyMAD(Number(activity.price))}</p>
                  <p>Bookings: {activity._count.bookings}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/provider/activities/${activity.id}/edit`} className="rounded border px-2 py-1">Edit</Link>
                  <Link href="/provider/schedules" className="rounded border px-2 py-1">Schedules</Link>
                  <Link href="/provider/bookings" className="rounded border px-2 py-1">Bookings</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{activity.title}</td>
                    <td className="px-4 py-3">{activity.city}</td>
                    <td className="px-4 py-3">{activity.category}</td>
                    <td className="px-4 py-3"><ActivityStatusBadge isActive={activity.isActive} /></td>
                    <td className="px-4 py-3">{formatCurrencyMAD(Number(activity.price))}</td>
                    <td className="px-4 py-3">{activity._count.bookings}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/provider/activities/${activity.id}/edit`} className="rounded border px-2 py-1">Edit</Link>
                        <Link href="/provider/schedules" className="rounded border px-2 py-1">Schedules</Link>
                        <Link href="/provider/bookings" className="rounded border px-2 py-1">Bookings</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
