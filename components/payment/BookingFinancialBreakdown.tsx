import { formatCurrencyMAD } from "@/lib/booking/utils";

type BookingFinancialBreakdownProps = {
  subtotal: number;
  serviceFee?: number | null;
  total: number;
  commissionAmount?: number;
  providerPayoutAmount?: number;
};

export function BookingFinancialBreakdown({ subtotal, serviceFee, total, commissionAmount, providerPayoutAmount }: BookingFinancialBreakdownProps) {
  return (
    <div className="space-y-1 text-sm text-slate-700">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatCurrencyMAD(subtotal)}</span>
      </div>
      {typeof serviceFee === "number" && serviceFee > 0 && (
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>{formatCurrencyMAD(serviceFee)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrencyMAD(total)}</span>
      </div>
      {typeof commissionAmount === "number" && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>Marketplace commission</span>
          <span>{formatCurrencyMAD(commissionAmount)}</span>
        </div>
      )}
      {typeof providerPayoutAmount === "number" && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>Provider payout</span>
          <span>{formatCurrencyMAD(providerPayoutAmount)}</span>
        </div>
      )}
    </div>
  );
}
