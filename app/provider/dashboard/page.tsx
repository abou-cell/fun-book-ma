import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { ScheduleManagement } from "@/components/provider/ScheduleManagement";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export default async function ProviderDashboardPage() {
  const user = await requireRole("PROVIDER");

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    include: {
      activities: {
        select: {
          id: true,
          title: true,
          schedules: {
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
            take: 25,
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              capacity: true,
              availableSpots: true,
              price: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  const bookings = provider
    ? await prisma.booking.findMany({
        where: {
          activity: {
            providerId: provider.id,
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          activity: { select: { title: true } },
          schedule: { select: { date: true, startTime: true } },
        },
        take: 30,
      })
    : [];

  const schedules =
    provider?.activities.flatMap((activity) =>
      activity.schedules.map((schedule) => ({
        id: schedule.id,
        activityTitle: activity.title,
        date: schedule.date.toISOString(),
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        capacity: schedule.capacity,
        availableSpots: schedule.availableSpots,
        price: Number(schedule.price),
        isActive: schedule.isActive,
      })),
    ) ?? [];

  const summary = bookings.reduce(
    (acc, booking) => {
      acc.totalBookings += 1;
      acc.grossRevenue += Number(booking.totalPrice);
      acc.totalCommissions += Number(booking.commissionAmount);
      acc.estimatedPayout += Number(booking.providerPayoutAmount);
      return acc;
    },
    { totalBookings: 0, grossRevenue: 0, totalCommissions: 0, estimatedPayout: 0 },
  );

  return (
    <NavbarPageLayout
      mainClassName="bg-slate-50"
      sectionClassName="mx-auto max-w-5xl space-y-6 px-4 pt-10 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Provider dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Manage your experiences</h1>
        <p className="mt-2 text-slate-600">Signed in as {user.email} with role {user.role}. Publish, update, and monitor activity bookings here.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total bookings</p><p className="text-xl font-semibold text-slate-900">{summary.totalBookings}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Gross revenue</p><p className="text-xl font-semibold text-slate-900">{formatCurrencyMAD(summary.grossRevenue)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total commissions</p><p className="text-xl font-semibold text-slate-900">{formatCurrencyMAD(summary.totalCommissions)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Estimated payout</p><p className="text-xl font-semibold text-slate-900">{formatCurrencyMAD(summary.estimatedPayout)}</p></div>
      </section>

      <ScheduleManagement
        activities={provider?.activities.map((activity) => ({ id: activity.id, title: activity.title })) ?? []}
        schedules={schedules}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bookings management</h2>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet for your activities.</p>}
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{booking.activity.title}</p>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              </div>
              <p className="text-slate-600">
                {booking.schedule.date.toLocaleDateString()} at {booking.schedule.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </p>
              <p className="text-slate-600">
                {booking.customerName} • {booking.customerEmail}
              </p>
              <p className="text-slate-600">{booking.participants} participants</p>
              <p className="text-slate-600">Commission: {formatCurrencyMAD(Number(booking.commissionAmount))}</p>
              <p className="text-slate-600">Payout: {formatCurrencyMAD(Number(booking.providerPayoutAmount))}</p>
              <p className="font-semibold text-slate-900">{formatCurrencyMAD(Number(booking.totalPrice))}</p>
            </div>
          ))}
        </div>
      </section>
    </NavbarPageLayout>
  );
}
