"use client";

import { usePathname } from "next/navigation";

import {
  defaultLocale,
  extractLocaleFromPathname,
  replaceLocaleInPathname,
  type AppLocale,
} from "@/lib/i18n/config";

export function useCurrentLocale() {
  const pathname = usePathname();
  return extractLocaleFromPathname(pathname) ?? defaultLocale;
}

export function withCurrentLocalePath(locale: AppLocale, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return replaceLocaleInPathname(normalized, locale);
}
