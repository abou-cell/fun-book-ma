import { RefundStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const statusStyles: Record<RefundStatus, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-sky-100 text-sky-800",
  REJECTED: "bg-rose-100 text-rose-800",
  PROCESSED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", statusStyles[status])}>{status}</span>
  );
}
