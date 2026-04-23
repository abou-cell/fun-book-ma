import { ProviderStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const statusStyles: Record<ProviderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  SUSPENDED: "bg-slate-200 text-slate-700",
};

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", statusStyles[status])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
