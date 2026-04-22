import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

export default async function AccountPage() {
  const user = await requireAuthenticatedUser();

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-brand">Account</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Welcome, {user.name}</h1>
          <p className="mt-2 text-slate-600">You are signed in as <span className="font-medium">{user.role}</span>.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Browse activities
            </Link>
            {user.role === "CLIENT" && (
              <button className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white">Book activities</button>
            )}
            {user.role === "PROVIDER" && (
              <Link
                href="/provider/dashboard"
                className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Go to provider dashboard
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin/dashboard" className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
                Go to admin dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
