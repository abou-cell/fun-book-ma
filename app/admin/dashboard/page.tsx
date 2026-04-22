import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      activity: { select: { title: true, provider: { select: { businessName: true } } } },
    },
    take: 40,
  });

  const summary = bookings.reduce(
    (acc, booking) => {
      acc.totalBookings += 1;
      acc.grossRevenue += Number(booking.totalPrice);
      acc.totalCommissions += Number(booking.commissionAmount);
      acc.totalPayout += Number(booking.providerPayoutAmount);
      return acc;
    },
    { totalBookings: 0, grossRevenue: 0, totalCommissions: 0, totalPayout: 0 },
  );

  return (
    <NavbarPageLayout
      mainClassName="bg-slate-50"
      sectionClassName="mx-auto max-w-6xl space-y-6 px-4 pt-10 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Admin dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Platform administration</h1>
        <p className="mt-2 text-slate-600">Signed in as {user.email} with role {user.role}. Review bookings, payment statuses, and commissions.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total bookings</p><p className="text-xl font-semibold text-slate-900">{summary.totalBookings}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Gross revenue</p><p className="text-xl font-semibold text-slate-900">{formatCurrencyMAD(summary.grossRevenue)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Commissions collected</p><p className="text-xl font-semibold text-slate-900">{formatCurrencyMAD(summary.totalCommissions)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Provider payout overview</p><p className="text-xl font-semibold text-slate-900">{formatCurrencyMAD(summary.totalPayout)}</p></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bookings overview</h2>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings found.</p>}
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{booking.activity.title}</p>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>
              <p className="text-slate-600">Provider: {booking.activity.provider.businessName}</p>
              <p className="text-slate-600">Customer: {booking.customerEmail}</p>
              <p className="text-slate-600">Gross: {formatCurrencyMAD(Number(booking.totalPrice))}</p>
              <p className="text-slate-600">Commission: {formatCurrencyMAD(Number(booking.commissionAmount))}</p>
              <p className="text-slate-600">Payout: {formatCurrencyMAD(Number(booking.providerPayoutAmount))}</p>
            </div>
          ))}
        </div>
      </section>
    </NavbarPageLayout>
  );
}
