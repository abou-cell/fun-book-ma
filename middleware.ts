import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session";

const protectedRoutes = {
  auth: ["/account"],
  provider: ["/provider/dashboard"],
  admin: ["/admin/dashboard"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAuthRoute = protectedRoutes.auth.some((route) => pathname.startsWith(route));
  const isProviderRoute = protectedRoutes.provider.some((route) => pathname.startsWith(route));
  const isAdminRoute = protectedRoutes.admin.some((route) => pathname.startsWith(route));

  if (!isAuthRoute && !isProviderRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isProviderRoute && session.role !== "PROVIDER") {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  if (isAdminRoute && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/provider/dashboard/:path*", "/admin/dashboard/:path*"],
};
