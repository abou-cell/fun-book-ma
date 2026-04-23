export const locales = ["fr", "ar", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "fr";
export const rtlLocales: AppLocale[] = ["ar"];
export const localeCookieName = "NEXT_LOCALE";

export const localeMeta: Record<
  AppLocale,
  {
    label: string;
    htmlLang: string;
    intl: string;
    dir: "rtl" | "ltr";
  }
> = {
  fr: { label: "FR", htmlLang: "fr-MA", intl: "fr-MA", dir: "ltr" },
  ar: { label: "AR", htmlLang: "ar-MA", intl: "ar-MA", dir: "rtl" },
  en: { label: "EN", htmlLang: "en-MA", intl: "en-MA", dir: "ltr" },
};

export function isValidLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}

export function isRtlLocale(locale: AppLocale) {
  return rtlLocales.includes(locale);
}

export function extractLocaleFromPathname(pathname: string): AppLocale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isValidLocale(first)) return first;
  return null;
}

export function stripLocaleFromPathname(pathname: string) {
  const locale = extractLocaleFromPathname(pathname);
  if (locale) {
    const segments = pathname.split("/").filter(Boolean).slice(1);
    return `/${segments.join("/")}` || "/";
  }

  return pathname;
}

export function withLocalePath(pathname: string, locale: AppLocale) {
  const withoutLocale = stripLocaleFromPathname(pathname);
  if (withoutLocale === "/") return `/${locale}`;
  return `/${locale}${withoutLocale}`;
}

export function replaceLocaleInPathname(pathname: string, nextLocale: AppLocale) {
  return withLocalePath(pathname, nextLocale);
}
