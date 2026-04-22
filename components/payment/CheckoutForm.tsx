"use client";

import { PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const paymentOptions: Array<{ value: PaymentMethod; label: string; description: string }> = [
  { value: PaymentMethod.ONLINE_MOCK, label: "Online card (mock)", description: "Simulated online payment for development." },
  { value: PaymentMethod.CASH_ON_SITE, label: "Cash on site", description: "Pay directly to the provider when the activity starts." },
];

export function CheckoutForm({ bookingId, initialIntentReference }: { bookingId: string; initialIntentReference?: string }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ONLINE_MOCK);
  const [intentReference, setIntentReference] = useState<string | undefined>(initialIntentReference);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      let effectiveIntentReference = intentReference;

      if (paymentMethod === PaymentMethod.ONLINE_MOCK && !effectiveIntentReference) {
        const intentResponse = await fetch(`/api/checkout/${bookingId}/intent`, { method: "POST" });
        const intentPayload = (await intentResponse.json()) as { error?: string; reference?: string };

        if (!intentResponse.ok || !intentPayload.reference) {
          setError(intentPayload.error ?? "Unable to start payment.");
          return;
        }

        effectiveIntentReference = intentPayload.reference;
        setIntentReference(intentPayload.reference);
      }

      const response = await fetch(`/api/checkout/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, intentReference: effectiveIntentReference }),
      });

      const payload = (await response.json()) as { error?: string; redirectPath?: string };

      if (!response.ok || !payload.redirectPath) {
        setError(payload.error ?? "Payment could not be completed.");
        return;
      }

      router.push(payload.redirectPath);
      router.refresh();
    } catch {
      setError("Payment could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {paymentOptions.map((option) => (
          <label key={option.value} className="block rounded-xl border border-slate-200 p-3 text-sm">
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-slate-900">{option.label}</p>
                <p className="text-slate-600">{option.description}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <div className="sticky bottom-3 z-10 bg-white/95 pb-1 pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Processing..." : "Confirm & pay"}
        </button>
      </div>
    </div>
  );
}
