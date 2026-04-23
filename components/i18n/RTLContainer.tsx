import { cn } from "@/lib/utils";

export function RTLContainer({ isRtl, children, className }: { isRtl: boolean; children: React.ReactNode; className?: string }) {
  return <div className={cn(isRtl ? "text-right" : "text-left", className)}>{children}</div>;
}
