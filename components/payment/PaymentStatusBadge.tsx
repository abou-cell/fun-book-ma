import { PaymentStatus } from "@prisma/client";

const statusStyles: Record<PaymentStatus, string> = {
  UNPAID: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-violet-100 text-violet-700",
  PARTIALLY_REFUNDED: "bg-indigo-100 text-indigo-700",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span>;
}
