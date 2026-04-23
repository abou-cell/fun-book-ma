export const locales = ["fr", "ar", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "fr";
export const rtlLocales: AppLocale[] = ["ar"];

export function isValidLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}

export function isRtlLocale(locale: AppLocale) {
  return rtlLocales.includes(locale);
}

export function stripLocaleFromPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && isValidLocale(segments[0])) {
    return `/${segments.slice(1).join("/")}` || "/";
  }

  return pathname;
}
