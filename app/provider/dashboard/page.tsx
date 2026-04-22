import Link from "next/link";

import { DashboardStatCard } from "@/components/provider/DashboardStatCard";
import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { ProviderEmptyState } from "@/components/provider/ProviderEmptyState";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireRole } from "@/lib/auth/guards";
import { getProviderByUserId, getProviderDashboardData } from "@/lib/provider/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-MA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ProviderDashboardPage() {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);

  if (!provider) {
    return <ProviderEmptyState title="Provider profile missing" description="Contact support to activate your provider dashboard." />;
  }

  const { activities, bookings, summary } = await getProviderDashboardData(provider.id);

  return (
    <>
      <ProviderHeader title="Dashboard overview" description="Track your listings, bookings, and payouts across Morocco." />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Total activities" value={summary.totalActivities} />
        <DashboardStatCard label="Active activities" value={summary.activeActivities} />
        <DashboardStatCard label="Total bookings" value={summary.totalBookings} />
        <DashboardStatCard label="Upcoming bookings" value={summary.upcomingBookings} />
        <DashboardStatCard label="Gross revenue" value={formatCurrencyMAD(summary.grossRevenue)} />
        <DashboardStatCard label="Total commissions" value={formatCurrencyMAD(summary.totalCommissions)} />
        <DashboardStatCard label="Estimated payout" value={formatCurrencyMAD(summary.estimatedPayout)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/provider/activities/new" className="block rounded-lg border p-2 hover:bg-slate-50">Create new activity</Link>
            <Link href="/provider/schedules" className="block rounded-lg border p-2 hover:bg-slate-50">Manage schedules</Link>
            <Link href="/provider/bookings" className="block rounded-lg border p-2 hover:bg-slate-50">View bookings</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Recent bookings</h2>
          <div className="mt-3 space-y-2 text-sm">
            {bookings.length === 0 ? <p className="text-slate-500">No bookings yet.</p> : bookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border p-3">
                <p className="font-medium break-words">{booking.customerName} • {booking.activity.title}</p>
                <p className="text-slate-600">{dateTimeFormatter.format(booking.schedule.startTime)} • {booking.participants} participants</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Recent activities</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activities.length === 0 ? <p className="text-sm text-slate-500">No activities yet.</p> : activities.map((activity) => (
            <div key={activity.id} className="rounded-xl border p-3 text-sm">
              <p className="font-semibold break-words">{activity.title}</p>
              <p className="text-slate-600">{activity.city} • {activity.category}</p>
              <p className="text-slate-600">{activity._count.bookings} bookings</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
