"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/provider/dashboard", label: "Overview" },
  { href: "/provider/activities", label: "Activities" },
  { href: "/provider/bookings", label: "Bookings" },
  { href: "/provider/schedules", label: "Schedules" },
  { href: "/provider/analytics", label: "Analytics" },
  { href: "/provider/settings", label: "Settings" },
];

export function ProviderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-3 lg:w-64 lg:p-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Provider area</p>
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
