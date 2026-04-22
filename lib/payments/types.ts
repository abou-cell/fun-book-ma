import { PaymentMethod, PaymentProvider, PaymentStatus } from "@prisma/client";

export type PaymentIntentInput = {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
};

export type PaymentIntentResult = {
  provider: PaymentProvider;
  clientSecret: string;
  reference: string;
  status: PaymentStatus;
};

export type ConfirmPaymentInput = {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  intentReference?: string;
};

export type ConfirmPaymentResult = {
  provider: PaymentProvider;
  reference: string;
  status: PaymentStatus;
  rawPayload?: Record<string, unknown>;
};

export interface PaymentGateway {
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
}
