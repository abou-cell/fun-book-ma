import { BookingFinancialBreakdown } from "@/components/payment/BookingFinancialBreakdown";

type PaymentSummaryProps = {
  subtotal: number;
  serviceFee?: number | null;
  total: number;
};

export function PaymentSummary({ subtotal, serviceFee, total }: PaymentSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Payment summary</h3>
      <div className="mt-2">
        <BookingFinancialBreakdown subtotal={subtotal} serviceFee={serviceFee} total={total} />
      </div>
    </div>
  );
}
