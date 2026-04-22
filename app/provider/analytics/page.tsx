import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProviderByUserId } from "@/lib/provider/service";

export default async function ProviderAnalyticsPage() {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);
  if (!provider) return null;

  const [bookings, topActivities] = await Promise.all([
    prisma.booking.findMany({ where: { activity: { providerId: provider.id } }, include: { schedule: { select: { date: true } } } }),
    prisma.activity.findMany({ where: { providerId: provider.id }, include: { _count: { select: { bookings: true } } }, orderBy: { bookings: { _count: "desc" } }, take: 5 }),
  ]);

  const revenue = bookings.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  const commissions = bookings.reduce((sum, item) => sum + Number(item.commissionAmount), 0);
  const payout = bookings.reduce((sum, item) => sum + Number(item.providerPayoutAmount), 0);

  const byMonth = new Map<string, number>();
  for (const booking of bookings) {
    const key = booking.schedule.date.toISOString().slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }

  return (
    <>
      <ProviderHeader title="Analytics" description="Monitor booking performance, revenue, and top-selling experiences." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Bookings</p><p className="text-xl font-semibold">{bookings.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Revenue</p><p className="text-xl font-semibold">{formatCurrencyMAD(revenue)}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Commissions</p><p className="text-xl font-semibold">{formatCurrencyMAD(commissions)}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Payout estimate</p><p className="text-xl font-semibold">{formatCurrencyMAD(payout)}</p></div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-semibold">Top activities</h2>
          <div className="mt-3 space-y-2 text-sm">{topActivities.map((activity) => <p key={activity.id}>{activity.title} • {activity._count.bookings} bookings</p>)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-semibold">Booking trend (monthly)</h2>
          <div className="mt-3 space-y-2 text-sm">{Array.from(byMonth.entries()).sort().map(([month, count]) => <p key={month}>{month}: {"▮".repeat(Math.min(count, 20))} ({count})</p>)}</div>
        </div>
      </section>
    </>
  );
}
