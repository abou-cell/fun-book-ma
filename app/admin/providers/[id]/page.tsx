import { notFound } from "next/navigation";
import { ProviderStatus } from "@prisma/client";

import { ProviderStatusBadge } from "@/components/admin/ProviderStatusBadge";
import { formatCurrencyMAD } from "@/lib/booking/utils";
import { updateProviderStatusAction } from "@/lib/admin/actions";
import { getProviderDetail } from "@/lib/admin/service";
import { prisma } from "@/lib/prisma";

export default async function AdminProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await getProviderDetail(id);
  if (!provider) notFound();

  const bookings = await prisma.booking.findMany({
    where: { activity: { providerId: id } },
    select: { totalPrice: true, commissionAmount: true, providerPayoutAmount: true },
  });

  const totals = bookings.reduce(
    (acc, booking) => {
      acc.revenue += Number(booking.totalPrice);
      acc.commission += Number(booking.commissionAmount);
      acc.payout += Number(booking.providerPayoutAmount);
      return acc;
    },
    { revenue: 0, commission: 0, payout: 0 },
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">{provider.businessName}</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><ProviderStatusBadge status={provider.status} /><p className="text-sm text-slate-500">Reviewed by: {provider.reviewedBy ?? "-"}</p></div>
        <p className="mt-2 text-sm text-slate-700">{provider.description}</p>
        <p className="text-sm text-slate-500">Owner: {provider.user.name} ({provider.user.email})</p>
        <p className="text-sm text-slate-500">Activities: {provider.activities.length} · Bookings: {bookings.length}</p>
        <p className="text-sm text-slate-500">Revenue: {formatCurrencyMAD(totals.revenue)} · Commission: {formatCurrencyMAD(totals.commission)} · Payout: {formatCurrencyMAD(totals.payout)}</p>

        <form action={updateProviderStatusAction} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="providerId" value={provider.id} />
          <select name="status" defaultValue={provider.status} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {Object.values(ProviderStatus).map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <input name="reason" placeholder="Rejection / moderation note" className="min-w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Update provider</button>
        </form>
      </div>
    </div>
  );
}
