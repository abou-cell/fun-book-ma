import { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("ADMIN");

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <AdminHeader />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-8 lg:grid-cols-[260px,1fr] lg:px-6">
        <AdminSidebar />
        <div className="space-y-4">{children}</div>
      </section>
    </main>
  );
}
