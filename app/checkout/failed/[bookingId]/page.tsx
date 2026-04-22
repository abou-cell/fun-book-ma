import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type FailedPageProps = { params: Promise<{ bookingId: string }> };

export default async function CheckoutFailedPage({ params }: FailedPageProps) {
  const user = await requireAuth();
  const { bookingId } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: user.id },
    include: { activity: { select: { slug: true } } },
  });

  if (!booking) notFound();

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-rose-700">Payment not completed</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">We could not process your payment</h1>
        <p className="mt-2 text-sm text-slate-600">Please review your booking and try another method.</p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/checkout/${booking.id}`} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Retry checkout</Link>
          <Link href={`/activities/${booking.activity.slug}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Back to activity</Link>
        </div>
      </div>
    </NavbarPageLayout>
  );
}
