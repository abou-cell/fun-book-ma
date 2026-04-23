import { cn } from "@/lib/utils";

export function RTLContainer({ isRtl, children, className }: { isRtl: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(isRtl ? "text-right [unicode-bidi:plaintext]" : "text-left", className)}
    >
      {children}
    </div>
  );
}
