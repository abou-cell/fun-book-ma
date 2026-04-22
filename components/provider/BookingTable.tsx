import { BookingStatus, PaymentStatus } from "@prisma/client";

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { formatCurrencyMAD } from "@/lib/booking/utils";

export function BookingTable({ bookings }: { bookings: Array<{
  id: string;
  customerName: string;
  participants: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  providerPayoutAmount: number;
  activityTitle: string;
  dateTime: Date;
}> }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Participants</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payout</th></tr></thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-slate-100">
              <td className="px-4 py-3">{booking.customerName}</td>
              <td className="px-4 py-3">{booking.activityTitle}</td>
              <td className="px-4 py-3">{booking.dateTime.toLocaleString()}</td>
              <td className="px-4 py-3">{booking.participants}</td>
              <td className="px-4 py-3"><PaymentStatusBadge status={booking.paymentStatus} /></td>
              <td className="px-4 py-3"><BookingStatusBadge status={booking.status} /></td>
              <td className="px-4 py-3">{formatCurrencyMAD(booking.providerPayoutAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
