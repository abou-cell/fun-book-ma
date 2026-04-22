import { BookingStatus } from "@prisma/client";

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span>;
}
