import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  canAccessRoute,
  getLandingPageForRole,
  getRoutePolicy,
} from "@/lib/auth/rbac";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const session = request.auth;
  const matchedPolicy = getRoutePolicy(pathname);

  if (!matchedPolicy) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessRoute(pathname, session.user.role)) {
    return NextResponse.redirect(
      new URL(getLandingPageForRole(session.user.role) ?? DEFAULT_AUTHENTICATED_ROUTE, request.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/provider/:path*", "/admin/:path*"],
};
