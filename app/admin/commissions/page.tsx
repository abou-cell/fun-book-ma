import { updateProviderCommissionAction } from "@/lib/admin/actions";
import { getCommissionOverview } from "@/lib/admin/service";
import { formatCurrencyMAD } from "@/lib/booking/utils";

export default async function AdminCommissionsPage() {
  const overview = await getCommissionOverview();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Commissions management</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Default commission rate</p><p className="text-xl font-semibold">{(Number(overview.setting?.defaultCommissionRate ?? 0.1) * 100).toFixed(2)}%</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total commissions</p><p className="text-xl font-semibold">{formatCurrencyMAD(overview.totals.commissions)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Provider payout estimate</p><p className="text-xl font-semibold">{formatCurrencyMAD(overview.totals.payouts)}</p></div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Totals</th><th className="px-4 py-3">Commission Override</th></tr></thead><tbody>
          {overview.perProvider.map((row) => (
            <tr key={row.provider.id} className="border-t border-slate-100 align-top"><td className="px-4 py-3"><p className="font-medium">{row.provider.businessName}</p><p className="text-slate-500">Bookings: {row.bookings}</p></td><td className="px-4 py-3"><p>Commission: {formatCurrencyMAD(row.commissionTotal)}</p><p>Payout: {formatCurrencyMAD(row.payoutTotal)}</p></td><td className="px-4 py-3"><form action={updateProviderCommissionAction} className="space-y-1"><input type="hidden" name="providerId" value={row.provider.id} /><input type="number" step="0.01" min="0" max="1" name="commissionRate" defaultValue={Number(row.provider.commissionRate)} className="w-full rounded border border-slate-300 px-2 py-1" /><label className="flex items-center gap-2 text-xs"><input type="checkbox" name="customCommissionEnabled" defaultChecked={row.provider.customCommissionEnabled} />Enable custom rate</label><button className="rounded bg-slate-900 px-2 py-1 text-white">Save</button></form></td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
