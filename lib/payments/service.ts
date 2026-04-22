import { BookingStatus, PaymentMethod, PaymentProvider, PaymentStatus } from "@prisma/client";

import { sendPaymentSuccessEmail } from "@/lib/email/booking-notifications";
import { getPaymentGateway } from "@/lib/payments/providers";
import { prisma } from "@/lib/prisma";

type ProcessPaymentInput = {
  bookingId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  provider?: PaymentProvider;
  intentReference?: string;
};

export async function createCheckoutPaymentIntent(bookingId: string, userId: string, provider: PaymentProvider = PaymentProvider.MOCK_GATEWAY) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: {
      id: true,
      customerEmail: true,
      paymentStatus: true,
      status: true,
      totalPrice: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new Error("Cancelled bookings cannot be paid.");
  }

  if (booking.paymentStatus === PaymentStatus.PAID) {
    throw new Error("Booking is already paid.");
  }

  const gateway = getPaymentGateway(provider);
  const intent = await gateway.createPaymentIntent({
    bookingId,
    amount: Number(booking.totalPrice),
    currency: "MAD",
    customerEmail: booking.customerEmail,
  });

  return intent;
}

export async function processBookingPayment(input: ProcessPaymentInput) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: input.bookingId, userId: input.userId },
      include: {
        activity: {
          select: {
            title: true,
            provider: { select: { user: { select: { email: true } } } },
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("Cancelled bookings cannot be paid.");
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new Error("This booking has already been paid.");
    }

    if (input.paymentMethod === PaymentMethod.CASH_ON_SITE) {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentMethod: PaymentMethod.CASH_ON_SITE,
          paymentStatus: PaymentStatus.PENDING,
          status: BookingStatus.CONFIRMED,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          provider: PaymentProvider.MOCK_GATEWAY,
          amount: booking.totalPrice,
          currency: "MAD",
          status: PaymentStatus.PENDING,
          rawPayload: { mode: "cash_on_site" },
        },
      });

      return {
        bookingId: booking.id,
        status: updated.paymentStatus,
        redirectPath: `/checkout/success/${booking.id}`,
      };
    }

    const gateway = getPaymentGateway(input.provider);
    const confirmation = await gateway.confirmPayment({
      bookingId: booking.id,
      amount: Number(booking.totalPrice),
      currency: "MAD",
      paymentMethod: input.paymentMethod,
      intentReference: input.intentReference,
    });

    const status = confirmation.status;

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        provider: confirmation.provider,
        amount: booking.totalPrice,
        currency: "MAD",
        status,
        reference: confirmation.reference,
        rawPayload: confirmation.rawPayload,
      },
    });

    const paid = status === PaymentStatus.PAID;

    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        paymentMethod: input.paymentMethod,
        paymentStatus: status,
        paymentReference: confirmation.reference,
        paidAt: paid ? new Date() : null,
        status: paid ? BookingStatus.CONFIRMED : booking.status,
      },
    });

    if (paid) {
      await sendPaymentSuccessEmail({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        providerEmail: booking.activity.provider.user.email,
        bookingId: booking.id,
        activityTitle: booking.activity.title,
        amount: Number(booking.totalPrice),
      });
    }

    return {
      bookingId: booking.id,
      status: updatedBooking.paymentStatus,
      redirectPath: paid ? `/checkout/success/${booking.id}` : `/checkout/failed/${booking.id}`,
    };
  });
}
