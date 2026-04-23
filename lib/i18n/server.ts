import { cookies, headers } from "next/headers";

import { defaultLocale, type AppLocale, isValidLocale } from "@/lib/i18n/config";
import { getDictionary, type TranslationKey } from "@/lib/i18n/dictionaries";

export async function getRequestLocale(): Promise<AppLocale> {
  const headerBag = await headers();
  const cookieBag = await cookies();
  const fromHeader = headerBag.get("x-app-locale");
  const fromCookie = cookieBag.get("NEXT_LOCALE")?.value;

  if (fromHeader && isValidLocale(fromHeader)) return fromHeader;
  if (fromCookie && isValidLocale(fromCookie)) return fromCookie;

  return defaultLocale;
}

export async function getTranslator() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return {
    locale,
    t: (key: TranslationKey) => dictionary[key] ?? getDictionary(defaultLocale)[key] ?? key,
  };
}
