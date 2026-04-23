"use client";

import { PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCurrentLocale, withCurrentLocalePath } from "@/lib/i18n/client";

export function CheckoutForm({
  bookingId,
  initialIntentReference,
  enabledMethods,
}: {
  bookingId: string;
  initialIntentReference?: string;
  enabledMethods: PaymentMethod[];
}) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const dict = getDictionary(locale);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(enabledMethods[0] ?? PaymentMethod.ONLINE_CARD);
  const [intentReference, setIntentReference] = useState<string | undefined>(initialIntentReference);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const paymentOptions = useMemo(
    () => [
      { value: PaymentMethod.ONLINE_CARD, label: dict["payment.onlineCard"], description: dict["payment.onlineCardDescription"] },
      { value: PaymentMethod.CASH_ON_SITE, label: dict["payment.cashOnSite"], description: dict["payment.cashOnSiteDescription"] },
      { value: PaymentMethod.PARTIAL_PAYMENT, label: dict["payment.partialPayment"], description: dict["payment.partialPaymentDescription"] },
    ].filter((option) => enabledMethods.includes(option.value)),
    [dict, enabledMethods],
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (paymentMethod !== PaymentMethod.ONLINE_CARD || intentReference || isSubmitting) return;

    const controller = new AbortController();
    void (async () => {
      try {
        const intentResponse = await fetch(`/api/checkout/${bookingId}/intent`, { method: "POST", signal: controller.signal });
        if (!intentResponse.ok) return;
        const intentPayload = (await intentResponse.json()) as { reference?: string };
        if (intentPayload.reference) setIntentReference(intentPayload.reference);
      } catch {}
    })();

    return () => controller.abort();
  }, [bookingId, intentReference, isSubmitting, paymentMethod]);

  const handleConfirmPayment = async () => {
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      let effectiveIntentReference = intentReference;
      if (paymentMethod === PaymentMethod.ONLINE_CARD && !effectiveIntentReference) {
        const intentResponse = await fetch(`/api/checkout/${bookingId}/intent`, { method: "POST", signal: abortRef.current.signal });
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
        signal: abortRef.current.signal,
      });

      const payload = (await response.json()) as { error?: string; redirectPath?: string };
      if (!response.ok || !payload.redirectPath) {
        setError(payload.error ?? "Payment could not be completed.");
        return;
      }

      router.push(withCurrentLocalePath(locale, payload.redirectPath));
      router.refresh();
    } catch {
      setError("Payment could not be completed.");
    } finally {
      setIsSubmitting(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} options={paymentOptions} />
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      <div className="sticky bottom-0 z-10 -mx-6 border-t border-slate-200 bg-white/95 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-none sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button type="button" onClick={handleConfirmPayment} disabled={isSubmitting} className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300">
          {isSubmitting ? dict["checkout.processing"] : dict["checkout.confirmAndPay"]}
        </button>
      </div>
    </div>
  );
}
