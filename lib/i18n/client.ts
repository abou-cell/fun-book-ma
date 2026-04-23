"use client";

import { usePathname } from "next/navigation";

import { defaultLocale, isValidLocale } from "@/lib/i18n/config";

export function useCurrentLocale() {
  const pathname = usePathname();
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isValidLocale(first) ? first : defaultLocale;
}

export function withCurrentLocalePath(locale: string, path: string) {
  if (path.startsWith("/")) return `/${locale}${path === "/" ? "" : path}`;
  return `/${locale}/${path}`;
}
