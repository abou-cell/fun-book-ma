import type { AppLocale } from "@/lib/i18n/config";

export const MOROCCO_CURRENCY = "MAD";

function localeToIntl(locale: AppLocale = "fr") {
  if (locale === "ar") return "ar-MA";
  if (locale === "en") return "en-MA";
  return "fr-MA";
}

export function formatCurrency(value: number, locale: AppLocale = "fr", currency = MOROCCO_CURRENCY) {
  return new Intl.NumberFormat(localeToIntl(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateByLocale(date: Date | string | number, locale: AppLocale = "fr") {
  return new Intl.DateTimeFormat(localeToIntl(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("212") && digits.length >= 11) {
    return `+212 ${digits.slice(3, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`.trim();
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+212 ${digits.slice(1, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }

  return phone;
}
