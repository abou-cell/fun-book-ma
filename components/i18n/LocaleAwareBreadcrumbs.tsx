import Link from "next/link";

import { getRequestLocale } from "@/lib/i18n/server";

type Item = { label: string; href: string };

export async function LocaleAwareBreadcrumbs({ items }: { items: Item[] }) {
  const locale = await getRequestLocale();

  return (
    <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const href = `/${locale}${item.href === "/" ? "" : item.href}`;
          return (
            <li key={`${item.href}-${item.label}`} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <Link href={href} className="hover:text-slate-900">{item.label}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
