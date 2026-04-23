import Link from "next/link";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { ModerationStatusBadge } from "@/components/admin/ModerationStatusBadge";
import { ProviderStatusBadge } from "@/components/admin/ProviderStatusBadge";
import { formatCurrencyMAD } from "@/lib/booking/utils";

import { getAdminDashboardData } from "@/lib/admin/service";

export default async function AdminDashboardPage() {
  const { metrics, recentBookings, recentProviderSignups, recentPendingActivities } = await getAdminDashboardData();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Admin dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Marketplace back office</h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard label="Total users" value={metrics.users} />
        <AdminStatCard label="Total providers" value={metrics.providers} />
        <AdminStatCard label="Pending provider validations" value={metrics.pendingProviders} />
        <AdminStatCard label="Total activities" value={metrics.activities} />
        <AdminStatCard label="Pending activity validations" value={metrics.pendingActivities} />
        <AdminStatCard label="Total bookings" value={metrics.totalBookings} />
        <AdminStatCard label="Total gross revenue" value={formatCurrencyMAD(metrics.grossRevenue)} />
        <AdminStatCard label="Commissions collected" value={formatCurrencyMAD(metrics.totalCommissions)} />
        <AdminStatCard label="Estimated provider payouts" value={formatCurrencyMAD(metrics.estimatedProviderPayouts)} />
        <AdminStatCard label="Total refunds" value={formatCurrencyMAD(metrics.totalRefunds)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Recent bookings</h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentBookings.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                <p className="font-medium text-slate-900">{item.activity.title}</p>
                <p className="text-slate-500">{item.customerEmail}</p>
              </div>
            ))}
            {recentBookings.length === 0 ? <AdminEmptyState title="No bookings" description="Recent bookings appear here." /> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Recent provider signups</h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentProviderSignups.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{item.businessName}</p>
                  <ProviderStatusBadge status={item.status} />
                </div>
                <p className="text-slate-500">{item.user.email}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Recent pending activities</h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentPendingActivities.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-slate-500">{item.provider.businessName}</p>
                <ModerationStatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            ["Review providers", "/admin/providers"],
            ["Moderate activities", "/admin/activities"],
            ["Monitor bookings", "/admin/bookings"],
            ["Manage refunds", "/admin/refunds"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
