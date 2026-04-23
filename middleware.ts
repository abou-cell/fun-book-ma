import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  canAccessRoute,
  getLandingPageForRole,
  getRoutePolicy,
} from "@/lib/auth/rbac";
import { env } from "@/lib/env";
import {
  defaultLocale,
  extractLocaleFromPathname,
  isValidLocale,
  localeCookieName,
  locales,
  stripLocaleFromPathname,
  withLocalePath,
} from "@/lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;
const ONE_YEAR_SECONDS = 31_536_000;

function applySecurityHeaders(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("x-xss-protection", "0");

  if (env.isProduction) {
    response.headers.set("strict-transport-security", `max-age=${ONE_YEAR_SECONDS}; includeSubDomains; preload`);
  }

  return response;
}

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
  const requestId = crypto.randomUUID();

  if (pathname.startsWith("/api/health")) {
    return applySecurityHeaders(NextResponse.next(), requestId);
  }

  if (env.MAINTENANCE_MODE && !pathname.startsWith("/admin")) {
    const response = NextResponse.json(
      { error: "Maintenance mode enabled. Please retry shortly." },
      { status: 503 },
    );
    response.headers.set("x-maintenance-mode", "true");
    return applySecurityHeaders(response, requestId);
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return applySecurityHeaders(NextResponse.next(), requestId);
  }

  const localeFromPath = extractLocaleFromPathname(pathname);

  if (!localeFromPath) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePath(pathname, resolvePreferredLocale(request));
    return applySecurityHeaders(NextResponse.redirect(url), requestId);
  }

  const locale = localeFromPath;
  const pathnameWithoutLocale = stripLocaleFromPathname(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-app-locale", locale);
  requestHeaders.set("x-request-id", requestId);

  const matchedPolicy = getRoutePolicy(pathnameWithoutLocale);
  if (matchedPolicy) {
    const session = request.auth;

    if (!session?.user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(localeCookieName, locale, { path: "/" });
      return applySecurityHeaders(response, requestId);
    }

    if (!canAccessRoute(pathnameWithoutLocale, session.user.role)) {
      const fallback = getLandingPageForRole(session.user.role) ?? DEFAULT_AUTHENTICATED_ROUTE;
      const response = NextResponse.redirect(new URL(`/${locale}${fallback}`, request.url));
      response.cookies.set(localeCookieName, locale, { path: "/" });
      return applySecurityHeaders(response, requestId);
    }
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathnameWithoutLocale;
  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.cookies.set(localeCookieName, locale, { path: "/" });
  return applySecurityHeaders(response, requestId);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
