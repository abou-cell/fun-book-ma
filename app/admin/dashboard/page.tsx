import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");

  return (
    <NavbarPageLayout
      mainClassName="bg-slate-50"
      sectionClassName="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Admin dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Platform administration</h1>
        <p className="mt-2 text-slate-600">Signed in as {user.email} with role {user.role}. Review providers, moderate listings, and audit bookings.</p>
      </div>
    </NavbarPageLayout>
  );
}
