import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { DEFAULT_AUTHENTICATED_ROUTE, getLandingPageForRole } from "@/lib/auth/constants";

const roleProtectedRoutes = [
  { prefix: "/provider/dashboard", requiredRole: "PROVIDER" },
  { prefix: "/admin/dashboard", requiredRole: "ADMIN" },
] as const;

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const session = request.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  const matched = roleProtectedRoutes.find((route) => pathname.startsWith(route.prefix));

  if (matched && session.user.role !== matched.requiredRole) {
    return NextResponse.redirect(
      new URL(getLandingPageForRole(session.user.role) ?? DEFAULT_AUTHENTICATED_ROUTE, request.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/provider/dashboard/:path*", "/admin/dashboard/:path*"],
};
