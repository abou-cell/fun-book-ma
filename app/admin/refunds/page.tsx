import { RefundStatus } from "@prisma/client";

import { RefundStatusBadge } from "@/components/admin/RefundStatusBadge";
import { updateRefundStatusAction } from "@/lib/admin/actions";
import { getRefunds } from "@/lib/admin/service";
import { formatCurrencyMAD } from "@/lib/booking/utils";

export default async function AdminRefundsPage() {
  const refunds = await getRefunds();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Refunds management</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Refund</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Workflow</th></tr></thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3"><p className="font-medium">{formatCurrencyMAD(Number(refund.amount))}</p><p className="text-slate-500">{refund.booking.activity.title}</p><p className="text-slate-500">Reason: {refund.reason}</p><p className="text-slate-500">Requested: {new Date(refund.requestedAt).toLocaleString()}</p></td>
                <td className="px-4 py-3"><RefundStatusBadge status={refund.status} /></td>
                <td className="px-4 py-3">
                  <form action={updateRefundStatusAction} className="space-y-2">
                    <input type="hidden" name="refundId" value={refund.id} />
                    <select name="status" defaultValue={refund.status} className="w-full rounded border border-slate-300 px-2 py-1">
                      {Object.values(RefundStatus).map((item)=><option key={item} value={item}>{item}</option>)}
                    </select>
                    <input name="notes" defaultValue={refund.notes ?? ""} placeholder="Notes" className="w-full rounded border border-slate-300 px-2 py-1" />
                    <button className="rounded bg-slate-900 px-2 py-1 text-white">Update</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
