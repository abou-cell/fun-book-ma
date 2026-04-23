import { PaymentStatus } from "@prisma/client";

import { isSuccessfulPaymentStatus, paymentStatusToCheckoutRoute } from "@/lib/payments/status";

describe("payment status logic", () => {
  it("maps status to success and failure paths", () => {
    expect(isSuccessfulPaymentStatus(PaymentStatus.PAID)).toBe(true);
    expect(isSuccessfulPaymentStatus(PaymentStatus.FAILED)).toBe(false);
    expect(paymentStatusToCheckoutRoute(PaymentStatus.PAID, "b1")).toContain("/checkout/success/b1");
    expect(paymentStatusToCheckoutRoute(PaymentStatus.FAILED, "b1")).toContain("/checkout/failed/b1");
  });
});
