import { ActivityModerationStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const statusStyles: Record<ActivityModerationStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  INACTIVE: "bg-slate-200 text-slate-700",
};

export function ModerationStatusBadge({ status }: { status: ActivityModerationStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", statusStyles[status])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
