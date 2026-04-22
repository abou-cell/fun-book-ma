import { BookingStatus, PaymentStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { CheckoutForm } from "@/components/payment/CheckoutForm";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PaymentSummary } from "@/components/payment/PaymentSummary";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type CheckoutPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const user = await requireAuth("/login");
  const { bookingId } = await params;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: user.id,
    },
    include: {
      activity: { select: { title: true } },
      schedule: { select: { date: true, startTime: true } },
    },
  });

  if (!booking) {
    notFound();
  }

  if (booking.status === BookingStatus.CANCELLED) {
    redirect(`/checkout/failed/${booking.id}`);
  }

  if (booking.paymentStatus === PaymentStatus.PAID) {
    redirect(`/checkout/success/${booking.id}`);
  }

  return (
    <NavbarPageLayout sectionClassName="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-brand">Checkout</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Complete your booking payment</h1>
            <p className="mt-1 text-sm text-slate-600">Use this secure mock checkout now; later you can plug in a Morocco-compatible gateway.</p>

            <div className="mt-4 space-y-1 text-sm">
              <p><span className="font-semibold text-slate-900">Activity:</span> {booking.activity.title}</p>
              <p><span className="font-semibold text-slate-900">Date:</span> {booking.schedule.date.toLocaleDateString()}</p>
              <p><span className="font-semibold text-slate-900">Time:</span> {booking.schedule.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}</p>
              <p><span className="font-semibold text-slate-900">Participants:</span> {booking.participants}</p>
              <p className="flex items-center gap-2"><span className="font-semibold text-slate-900">Payment status:</span> <PaymentStatusBadge status={booking.paymentStatus} /></p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Payment method</h2>
            <p className="mt-1 text-sm text-slate-600">Choose a payment method to confirm this booking.</p>
            <div className="mt-4">
              <CheckoutForm bookingId={booking.id} />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <PaymentSummary subtotal={Number(booking.subtotal)} serviceFee={booking.serviceFee ? Number(booking.serviceFee) : null} total={Number(booking.totalPrice)} />
        </aside>
      </div>
    </NavbarPageLayout>
  );
}
