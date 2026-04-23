import { PaymentStatus } from "@prisma/client";

const TERMINAL_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
]);

export function isTerminalPaymentStatus(status: PaymentStatus) {
  return TERMINAL_STATUSES.has(status);
}

export function isSuccessfulPaymentStatus(status: PaymentStatus) {
  return status === PaymentStatus.PAID;
}

export function paymentStatusToCheckoutRoute(status: PaymentStatus, bookingId: string) {
  switch (status) {
    case PaymentStatus.PAID:
    case PaymentStatus.REFUNDED:
    case PaymentStatus.PARTIALLY_REFUNDED:
      return `/checkout/success/${bookingId}`;
    case PaymentStatus.PENDING:
    case PaymentStatus.UNPAID:
      return `/checkout/${bookingId}`;
    case PaymentStatus.FAILED:
      return `/checkout/failed/${bookingId}`;
    default:
      return `/checkout/${bookingId}`;
  }
}
