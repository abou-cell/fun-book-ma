import { ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { ProviderSidebar } from "@/components/provider/ProviderSidebar";
import { requireRole } from "@/lib/auth/guards";

export default async function ProviderLayout({ children }: { children: ReactNode }) {
  await requireRole("PROVIDER");

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-8 lg:grid-cols-[260px,1fr] lg:px-6">
        <ProviderSidebar />
        <div className="space-y-4">{children}</div>
      </section>
    </main>
  );
}
