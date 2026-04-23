"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  defaultLocale,
  extractLocaleFromPathname,
  localeMeta,
  locales,
  replaceLocaleInPathname,
  type AppLocale,
} from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentLocale = extractLocaleFromPathname(pathname) ?? defaultLocale;

  const changeLocale = (nextLocale: AppLocale) => {
    const nextPath = replaceLocaleInPathname(pathname, nextLocale);
    const query = searchParams.toString();
    router.replace(query ? `${nextPath}?${query}` : nextPath, { scroll: false });
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs"
      role="group"
      aria-label="Language switcher"
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => changeLocale(locale)}
          aria-pressed={currentLocale === locale}
          className={`rounded-full px-2.5 py-1 font-semibold ${currentLocale === locale ? "bg-slate-900 text-white" : "text-slate-600"}`}
        >
          {localeMeta[locale].label}
        </button>
      ))}
    </div>
  );
}
