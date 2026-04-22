import { formatCurrencyMAD } from "@/lib/booking/utils";

type BookingSummaryProps = {
  participants: number;
  unitPrice: number;
};

export function BookingSummary({ participants, unitPrice }: BookingSummaryProps) {
  const total = participants * unitPrice;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <div className="flex justify-between">
        <span>Price per person</span>
        <span>{formatCurrencyMAD(unitPrice)}</span>
      </div>
      <div className="mt-1 flex justify-between">
        <span>Participants</span>
        <span>{participants}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrencyMAD(total)}</span>
      </div>
    </div>
  );
}
