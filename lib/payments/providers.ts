import { PaymentProvider } from "@prisma/client";

import type { PaymentGateway } from "@/lib/payments/types";
import { mockPaymentGateway } from "@/lib/payments/mock-gateway";

const providerRegistry: Record<PaymentProvider, PaymentGateway> = {
  MOCK_GATEWAY: mockPaymentGateway,
};

export function getPaymentGateway(provider: PaymentProvider = PaymentProvider.MOCK_GATEWAY) {
  return providerRegistry[provider];
}
