import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_AUTHENTICATED_ROUTE, SESSION_COOKIE_NAME, getLandingPageForRole } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session";

type ProtectedRouteGroup = {
  routes: string[];
  requiredRole?: "PROVIDER" | "ADMIN";
};

const protectedRouteGroups: ProtectedRouteGroup[] = [
  { routes: ["/account"] },
  { routes: ["/provider/dashboard"], requiredRole: "PROVIDER" },
  { routes: ["/admin/dashboard"], requiredRole: "ADMIN" },
];

function getLoginRedirect(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  return NextResponse.redirect(loginUrl);
}

function getMatchedGroup(pathname: string) {
  return protectedRouteGroups.find((group) => group.routes.some((route) => pathname.startsWith(route)));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matchedGroup = getMatchedGroup(pathname);

  if (!matchedGroup) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return getLoginRedirect(request, pathname);
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return getLoginRedirect(request, pathname);
  }

  if (matchedGroup.requiredRole && session.role !== matchedGroup.requiredRole) {
    return NextResponse.redirect(new URL(getLandingPageForRole(session.role) ?? DEFAULT_AUTHENTICATED_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/provider/dashboard/:path*", "/admin/dashboard/:path*"],
};
