import type { AppLocale } from "@/lib/i18n/config";
import { formatCurrency, formatDateByLocale } from "@/lib/localization/format";

export function formatCurrencyMAD(value: number, locale: AppLocale = "fr") {
  return formatCurrency(value, locale, "MAD");
}

export function formatDateLabel(date: string | Date, locale: AppLocale = "fr") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale === "en" ? "en-MA" : "fr-MA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function formatTimeLabel(date: string | Date, locale: AppLocale = "fr") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale === "en" ? "en-MA" : "fr-MA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export { formatDateByLocale };
