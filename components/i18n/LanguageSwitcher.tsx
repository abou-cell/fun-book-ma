"use client";

import { usePathname, useRouter } from "next/navigation";

import { defaultLocale, isValidLocale, locales } from "@/lib/i18n/config";

const labels: Record<string, string> = { fr: "FR", ar: "AR", en: "EN" };

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const parts = pathname.split("/").filter(Boolean);
  const currentLocale = parts[0] && isValidLocale(parts[0]) ? parts[0] : defaultLocale;

  const changeLocale = (nextLocale: string) => {
    const nextParts = [...parts];
    if (nextParts[0] && isValidLocale(nextParts[0])) {
      nextParts[0] = nextLocale;
    } else {
      nextParts.unshift(nextLocale);
    }

    const nextPath = `/${nextParts.join("/")}`;
    router.push(nextPath);
  };

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => changeLocale(locale)}
          className={`rounded-full px-2.5 py-1 font-semibold ${currentLocale === locale ? "bg-slate-900 text-white" : "text-slate-600"}`}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
