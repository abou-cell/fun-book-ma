import Link from "next/link";
import { Menu, Mountain } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <span className="rounded-xl bg-brand p-2 text-white">
            <Mountain size={18} />
          </span>
          FunBook Morocco
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#categories" className="transition hover:text-slate-900">
            Categories
          </Link>
          <Link href="/#popular" className="transition hover:text-slate-900">
            Popular
          </Link>
          {user ? (
            <>
              <Link href="/account" className="transition hover:text-slate-900">
                Account
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Get started
              </Link>
            </>
          )}
        </nav>

        <button className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-700 md:hidden">
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
