"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/commissions", label: "Commissions" },
  { href: "/admin/refunds", label: "Refunds" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/cities", label: "Cities" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-3 lg:w-64 lg:p-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin area</p>
      <nav className="mt-2 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive ? "bg-brand/10 text-brand" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
