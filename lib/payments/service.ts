import {
  BookingStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

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

type SuccessfulPaymentEmailJob = {
  customerName: string;
  customerEmail: string;
  providerEmail?: string | null;
  bookingId: string;
  activityTitle: string;
  amount: number;
};

type PaymentResult = {
  bookingId: string;
  status: PaymentStatus;
  redirectPath: string;
  emailJob: SuccessfulPaymentEmailJob | null;
};

function buildPaymentError(message: string) {
  return new Error(message);
}

function validatePaymentRequest(input: ProcessPaymentInput) {
  if (input.paymentMethod === PaymentMethod.ONLINE_MOCK && !input.intentReference) {
    throw buildPaymentError("Payment authorization expired. Please retry checkout.");
  }
}

function getRedirectPath(bookingId: string, status: PaymentStatus) {
  return status === PaymentStatus.PAID ? `/checkout/success/${bookingId}` : `/checkout/failed/${bookingId}`;
}

function sendPaymentSuccessEmailInBackground(payload: SuccessfulPaymentEmailJob | null) {
  if (!payload) {
    return;
  }

  queueMicrotask(() => {
    void sendPaymentSuccessEmail(payload).catch((error) => {
      console.warn("[payments] payment success notification failed", {
        bookingId: payload.bookingId,
        error,
      });
    });
  });
}

async function findBookingForCheckout(bookingId: string, userId: string) {
  return prisma.booking.findFirst({
    where: { id: bookingId, userId },
    select: {
      id: true,
      customerEmail: true,
      paymentStatus: true,
      status: true,
      totalPrice: true,
    },
  });
}

export async function createCheckoutPaymentIntent(
  bookingId: string,
  userId: string,
  provider: PaymentProvider = PaymentProvider.MOCK_GATEWAY,
) {
  const booking = await findBookingForCheckout(bookingId, userId);

  if (!booking) {
    throw buildPaymentError("Booking not found.");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw buildPaymentError("Cancelled bookings cannot be paid.");
  }

  if (booking.paymentStatus === PaymentStatus.PAID) {
    throw buildPaymentError("Booking is already paid.");
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
  validatePaymentRequest(input);

  const transactionResult = await prisma.$transaction(
    async (tx): Promise<PaymentResult> => {
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
        throw buildPaymentError("Booking not found.");
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw buildPaymentError("Cancelled bookings cannot be paid.");
      }

      if (booking.paymentStatus === PaymentStatus.PAID) {
        return {
          bookingId: booking.id,
          status: PaymentStatus.PAID,
          redirectPath: getRedirectPath(booking.id, PaymentStatus.PAID),
          emailJob: null,
        };
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
          emailJob: null,
        };
      }

      const gateway = getPaymentGateway(input.provider);
      const existingPayment = await tx.payment.findFirst({
        where: {
          bookingId: booking.id,
          reference: input.intentReference,
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingPayment) {
        if (existingPayment.status === PaymentStatus.PAID && booking.paymentStatus !== PaymentStatus.PAID) {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              paymentMethod: input.paymentMethod,
              paymentStatus: PaymentStatus.PAID,
              paymentReference: existingPayment.reference,
              paidAt: booking.paidAt ?? new Date(),
              status: BookingStatus.CONFIRMED,
            },
          });
        }

        return {
          bookingId: booking.id,
          status: existingPayment.status,
          redirectPath: getRedirectPath(booking.id, existingPayment.status),
          emailJob: null,
        };
      }

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

      const emailJob = paid
        ? {
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            providerEmail: booking.activity.provider.user.email,
            bookingId: booking.id,
            activityTitle: booking.activity.title,
            amount: Number(booking.totalPrice),
          }
        : null;

      return {
        bookingId: booking.id,
        status: updatedBooking.paymentStatus,
        redirectPath: getRedirectPath(booking.id, updatedBooking.paymentStatus),
        emailJob,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  sendPaymentSuccessEmailInBackground(transactionResult.emailJob);

  return {
    bookingId: transactionResult.bookingId,
    status: transactionResult.status,
    redirectPath: transactionResult.redirectPath,
  };
}
