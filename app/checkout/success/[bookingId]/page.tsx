import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { BookingFinancialBreakdown } from "@/components/payment/BookingFinancialBreakdown";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type SuccessPageProps = { params: Promise<{ bookingId: string }> };

export default async function CheckoutSuccessPage({ params }: SuccessPageProps) {
  const user = await requireAuth();
  const { bookingId } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: user.id },
    include: { activity: { select: { slug: true, title: true } } },
  });

  if (!booking) notFound();

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Payment successful</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Your checkout is complete</h1>
        <p className="mt-2 text-sm text-slate-600">We sent a confirmation email and your booking is now ready.</p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <BookingFinancialBreakdown
            subtotal={Number(booking.subtotal)}
            serviceFee={booking.serviceFee ? Number(booking.serviceFee) : null}
            total={Number(booking.totalPrice)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/booking/confirmation/${booking.id}`} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">View booking confirmation</Link>
          <Link href="/account" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Go to account</Link>
          <Link href={`/activities/${booking.activity.slug}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Back to activity</Link>
        </div>
      </div>
    </NavbarPageLayout>
  );
}
