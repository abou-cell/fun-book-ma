import { PaymentStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const statusStyles: Record<PaymentStatus, string> = {
  UNPAID: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-800",
  REFUNDED: "bg-indigo-100 text-indigo-800",
  PARTIALLY_REFUNDED: "bg-indigo-100 text-indigo-800",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", statusStyles[status])}>{status}</span>
  );
}
