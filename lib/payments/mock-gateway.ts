import { PaymentProvider, PaymentStatus } from "@prisma/client";

import type { ConfirmPaymentInput, ConfirmPaymentResult, PaymentGateway, PaymentIntentInput, PaymentIntentResult } from "@/lib/payments/types";

function buildReference(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function resolveMockSuccessRate() {
  const configured = Number(process.env.MOCK_PAYMENT_SUCCESS_RATE ?? "0.85");
  if (Number.isNaN(configured) || configured < 0 || configured > 1) {
    return 0.85;
  }

  return configured;
}

export const mockPaymentGateway: PaymentGateway = {
  async createPaymentIntent(_input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: PaymentProvider.MOCK_GATEWAY,
      clientSecret: buildReference("mock_client_secret"),
      reference: buildReference("mock_intent"),
      status: PaymentStatus.PENDING,
    };
  },

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    const successRate = resolveMockSuccessRate();
    const isSuccess = Math.random() < successRate;

    return {
      provider: PaymentProvider.MOCK_GATEWAY,
      reference: input.intentReference ?? buildReference("mock_pay"),
      status: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
      rawPayload: {
        gateway: "mock",
        successRate,
        requestedAmount: input.amount,
        currency: input.currency,
      },
    };
  },
};
