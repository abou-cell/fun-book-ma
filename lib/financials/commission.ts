const DEFAULT_COMMISSION_RATE = 0.1;

export type CommissionBreakdown = {
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  providerPayoutAmount: number;
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function resolveCommissionRate(rate?: number | null) {
  if (typeof rate !== "number" || Number.isNaN(rate) || rate < 0 || rate > 1) {
    return DEFAULT_COMMISSION_RATE;
  }

  return rate;
}

export function calculateCommission(subtotal: number, commissionRate?: number | null) {
  const safeSubtotal = Math.max(0, subtotal);
  const safeRate = resolveCommissionRate(commissionRate);
  return roundCurrency(safeSubtotal * safeRate);
}

export function calculateProviderPayout(subtotal: number, commissionAmount: number) {
  return roundCurrency(Math.max(0, subtotal - commissionAmount));
}

export function calculateBookingFinancials(subtotal: number, commissionRate?: number | null): CommissionBreakdown {
  const commissionAmount = calculateCommission(subtotal, commissionRate);
  const providerPayoutAmount = calculateProviderPayout(subtotal, commissionAmount);

  return {
    subtotal: roundCurrency(Math.max(0, subtotal)),
    commissionRate: resolveCommissionRate(commissionRate),
    commissionAmount,
    providerPayoutAmount,
  };
}
