import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { defaultLocale, isValidLocale, locales, stripLocaleFromPathname } from "@/lib/i18n/config";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  canAccessRoute,
  getLandingPageForRole,
  getRoutePolicy,
} from "@/lib/auth/rbac";

const PUBLIC_FILE = /\.(.*)$/;

function withLocale(pathname: string, locale: string) {
  if (pathname === "/") return `/${locale}`;
  return `/${locale}${pathname}`;
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

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!first || !isValidLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = withLocale(pathname, defaultLocale);
    return NextResponse.redirect(url);
  }

  const locale = first;
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
      response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
      return response;
    }

    if (!canAccessRoute(pathnameWithoutLocale, session.user.role)) {
      const fallback = getLandingPageForRole(session.user.role) ?? DEFAULT_AUTHENTICATED_ROUTE;
      const response = NextResponse.redirect(new URL(`/${locale}${fallback}`, request.url));
      response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
      return response;
    }
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathnameWithoutLocale;
  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
