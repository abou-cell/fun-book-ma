const DEFAULT_COMMISSION_RATE = 0.1;
const MIN_COMMISSION_RATE = 0;
const MAX_COMMISSION_RATE = 1;

export type CommissionBreakdown = {
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  providerPayoutAmount: number;
};

export type CheckoutAmountBreakdown = CommissionBreakdown & {
  serviceFee: number;
  total: number;
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function sanitizeCurrencyAmount(value: number) {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }

  return roundCurrency(Math.max(0, value));
}

export function resolveCommissionRate(rate?: number | null) {
  if (typeof rate !== "number" || Number.isNaN(rate)) {
    return DEFAULT_COMMISSION_RATE;
  }

  if (rate < MIN_COMMISSION_RATE) {
    return MIN_COMMISSION_RATE;
  }

  if (rate > MAX_COMMISSION_RATE) {
    return MAX_COMMISSION_RATE;
  }

  return roundCurrency(rate);
}

export function calculateCommission(subtotal: number, commissionRate?: number | null) {
  const safeSubtotal = sanitizeCurrencyAmount(subtotal);
  const safeRate = resolveCommissionRate(commissionRate);

  return roundCurrency(safeSubtotal * safeRate);
}

export function calculateProviderPayout(subtotal: number, commissionAmount: number) {
  return roundCurrency(Math.max(0, sanitizeCurrencyAmount(subtotal) - sanitizeCurrencyAmount(commissionAmount)));
}

export function calculateBookingFinancials(subtotal: number, commissionRate?: number | null): CommissionBreakdown {
  const normalizedSubtotal = sanitizeCurrencyAmount(subtotal);
  const normalizedRate = resolveCommissionRate(commissionRate);
  const commissionAmount = calculateCommission(normalizedSubtotal, normalizedRate);
  const providerPayoutAmount = calculateProviderPayout(normalizedSubtotal, commissionAmount);

  return {
    subtotal: normalizedSubtotal,
    commissionRate: normalizedRate,
    commissionAmount,
    providerPayoutAmount,
  };
}

export function calculateCheckoutAmounts(
  subtotal: number,
  serviceFee?: number | null,
  commissionRate?: number | null,
): CheckoutAmountBreakdown {
  const baseSubtotal = sanitizeCurrencyAmount(subtotal);
  const normalizedServiceFee = sanitizeCurrencyAmount(serviceFee ?? 0);
  const financials = calculateBookingFinancials(baseSubtotal, commissionRate);

  return {
    ...financials,
    serviceFee: normalizedServiceFee,
    total: roundCurrency(baseSubtotal + normalizedServiceFee),
  };
}
