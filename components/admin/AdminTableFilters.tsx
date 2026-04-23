import { ReactNode } from "react";

export function AdminTableFilters({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">{children}</div>;
}
