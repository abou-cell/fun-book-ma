import Link from "next/link";

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await requireAuth("/account");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      activity: { select: { title: true, slug: true } },
      schedule: { select: { date: true, startTime: true } },
    },
    take: 20,
  });

  return (
    <NavbarPageLayout
      mainClassName="bg-slate-50"
      sectionClassName="mx-auto max-w-4xl space-y-6 px-4 pt-10 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Account</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Welcome, {user.name}</h1>
        <p className="mt-2 text-slate-600">
          You are signed in as <span className="font-medium">{user.role}</span>.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            Browse activities
          </Link>
          {user.role === "CLIENT" && (
            <Link href="/activities" className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
              Book activities
            </Link>
          )}
          {user.role === "PROVIDER" && (
            <Link href="/provider/dashboard" className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
              Go to provider dashboard
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
              Go to admin dashboard
            </Link>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My bookings</h2>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-slate-500">You do not have bookings yet.</p>}
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/activities/${booking.activity.slug}`} className="font-semibold text-slate-900 hover:text-brand">
                  {booking.activity.title}
                </Link>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {booking.schedule.date.toLocaleDateString()} at {booking.schedule.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </p>
              <p className="text-sm text-slate-600">{booking.participants} participants</p>
              <p className="text-sm font-semibold text-slate-900">{formatCurrencyMAD(Number(booking.totalPrice))}</p>
            </div>
          ))}
        </div>
      </section>
    </NavbarPageLayout>
  );
}
