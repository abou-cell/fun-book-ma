import { BookingStatus, PaymentStatus } from "@prisma/client";

import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { cancelBookingAction, markBookingForRefundAction } from "@/lib/admin/actions";
import { getBookings } from "@/lib/admin/service";
import { formatCurrencyMAD } from "@/lib/booking/utils";

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Bookings management</h1>
      <AdminTableFilters>
        <select className="rounded border border-slate-300 px-2 py-2 text-sm"><option>Date range (placeholder)</option></select>
        <select className="rounded border border-slate-300 px-2 py-2 text-sm"><option>Booking status</option>{Object.values(BookingStatus).map((item)=><option key={item}>{item}</option>)}</select>
        <select className="rounded border border-slate-300 px-2 py-2 text-sm"><option>Payment status</option>{Object.values(PaymentStatus).map((item)=><option key={item}>{item}</option>)}</select>
      </AdminTableFilters>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Financials</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3"><p className="font-medium">{booking.activity.title}</p><p className="text-slate-500">Customer: {booking.customerEmail}</p><p className="text-slate-500">Provider: {booking.activity.provider.businessName}</p><p className="text-slate-500">Date: {new Date(booking.schedule.startTime).toLocaleString()}</p></td>
                <td className="px-4 py-3"><p>{booking.status}</p><PaymentStatusBadge status={booking.paymentStatus} /></td>
                <td className="px-4 py-3 text-slate-600"><p>Total: {formatCurrencyMAD(Number(booking.totalPrice))}</p><p>Commission: {formatCurrencyMAD(Number(booking.commissionAmount))}</p><p>Payout: {formatCurrencyMAD(Number(booking.providerPayoutAmount))}</p></td>
                <td className="px-4 py-3 space-y-2">
                  <form action={cancelBookingAction}><input type="hidden" name="bookingId" value={booking.id} /><button className="rounded border border-rose-300 px-2 py-1 text-rose-700">Cancel booking</button></form>
                  <form action={markBookingForRefundAction} className="space-y-1">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input name="amount" defaultValue={Number(booking.totalPrice)} className="w-full rounded border border-slate-300 px-2 py-1" />
                    <input name="reason" placeholder="Refund reason" className="w-full rounded border border-slate-300 px-2 py-1" />
                    <button className="rounded bg-slate-900 px-2 py-1 text-white">Mark refund</button>
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
