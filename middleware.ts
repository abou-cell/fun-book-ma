import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  defaultLocale,
  extractLocaleFromPathname,
  isValidLocale,
  localeCookieName,
  locales,
  stripLocaleFromPathname,
  withLocalePath,
} from "@/lib/i18n/config";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  canAccessRoute,
  getLandingPageForRole,
  getRoutePolicy,
} from "@/lib/auth/rbac";

const PUBLIC_FILE = /\.(.*)$/;

function resolvePreferredLocale(request: Request): (typeof locales)[number] {
  const cookieLocale = request.headers
    .get("cookie")
    ?.match(new RegExp(`${localeCookieName}=([^;]+)`))?.[1];
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const browserLocales = acceptLanguage
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const candidate of browserLocales) {
    if (candidate === "ar" || candidate.startsWith("ar-")) return "ar";
    if (candidate === "en" || candidate.startsWith("en-")) return "en";
    if (candidate === "fr" || candidate.startsWith("fr-")) return "fr";
  }

  return defaultLocale;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeFromPath = extractLocaleFromPathname(pathname);

  if (!localeFromPath) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePath(pathname, resolvePreferredLocale(request));
    return NextResponse.redirect(url);
  }

  const locale = localeFromPath;
  const pathnameWithoutLocale = stripLocaleFromPathname(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-app-locale", locale);

  const matchedPolicy = getRoutePolicy(pathnameWithoutLocale);
  if (matchedPolicy) {
    const session = request.auth;

    if (!session?.user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(localeCookieName, locale, { path: "/" });
      return response;
    }

    if (!canAccessRoute(pathnameWithoutLocale, session.user.role)) {
      const fallback = getLandingPageForRole(session.user.role) ?? DEFAULT_AUTHENTICATED_ROUTE;
      const response = NextResponse.redirect(new URL(`/${locale}${fallback}`, request.url));
      response.cookies.set(localeCookieName, locale, { path: "/" });
      return response;
    }
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathnameWithoutLocale;
  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.cookies.set(localeCookieName, locale, { path: "/" });
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
