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
  return isSuccessfulPaymentStatus(status) ? `/checkout/success/${bookingId}` : `/checkout/failed/${bookingId}`;
}
