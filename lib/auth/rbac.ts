import { UserRole } from "@prisma/client";

export const DEFAULT_AUTHENTICATED_ROUTE = "/account";

type RoutePolicy = {
  prefix: string;
  allowedRoles: UserRole[];
};

export const roleLandingPage: Record<UserRole, string> = {
  CLIENT: "/account",
  PROVIDER: "/provider/dashboard",
  ADMIN: "/admin/dashboard",
};

const routePolicies: RoutePolicy[] = [
  {
    prefix: "/account",
    allowedRoles: [UserRole.CLIENT, UserRole.PROVIDER, UserRole.ADMIN],
  },
  {
    prefix: "/provider/dashboard",
    allowedRoles: [UserRole.PROVIDER],
  },
  {
    prefix: "/admin/dashboard",
    allowedRoles: [UserRole.ADMIN],
  },
];

export function getLandingPageForRole(role?: UserRole | null) {
  if (!role) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  return roleLandingPage[role] ?? DEFAULT_AUTHENTICATED_ROUTE;
}

export function getRoutePolicy(pathname: string) {
  return routePolicies.find((policy) => pathname.startsWith(policy.prefix));
}

export function hasRequiredRole(role: UserRole | null | undefined, allowedRoles: UserRole[]) {
  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
}

export function canAccessRoute(pathname: string, role: UserRole | null | undefined) {
  const policy = getRoutePolicy(pathname);

  if (!policy) {
    return true;
  }

  return hasRequiredRole(role, policy.allowedRoles);
}
