import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type BookingConfirmationPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const user = await requireAuth();
  const { bookingId } = await params;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: user.id,
    },
    include: {
      activity: { select: { title: true, slug: true } },
      schedule: { select: { date: true, startTime: true, endTime: true } },
    },
  });

  if (!booking) {
    notFound();
  }

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Booking confirmed</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Thanks, {booking.customerName}</h1>
        <p className="mt-2 text-slate-600">Your booking request was created successfully.</p>

        <div className="mt-5 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-slate-900">Activity:</span> {booking.activity.title}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Date:</span> {booking.schedule.date.toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Time:</span> {booking.schedule.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} - {booking.schedule.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Participants:</span> {booking.participants}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Total price:</span> {formatCurrencyMAD(Number(booking.totalPrice))}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Status:</span> <BookingStatusBadge status={booking.status} />
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/activities/${booking.activity.slug}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Back to activity
          </Link>
          <Link href="/account" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
            View my bookings
          </Link>
        </div>
      </div>
    </NavbarPageLayout>
  );
}
