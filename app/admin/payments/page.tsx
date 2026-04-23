import { PaymentStatus } from "@prisma/client";

import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { getPayments } from "@/lib/admin/service";
import { formatCurrencyMAD } from "@/lib/booking/utils";

export default async function AdminPaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Payments management</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Filter/reconciliation placeholders ready for payment gateway integration.</div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-slate-100"><td className="px-4 py-3"><p className="font-medium">{formatCurrencyMAD(Number(payment.amount))}</p><p className="text-slate-500">{payment.booking.activity.title}</p><p className="text-slate-500">Ref: {payment.reference ?? "-"}</p></td><td className="px-4 py-3"><p>{payment.provider}</p><p>{payment.booking.customerEmail}</p></td><td className="px-4 py-3"><PaymentStatusBadge status={payment.status as PaymentStatus} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
