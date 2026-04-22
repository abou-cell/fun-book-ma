import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getLandingPageForRole, hasRequiredRole } from "@/lib/auth/rbac";

export async function requireAuth(redirectTo = "/account") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const fallbackPath = getLandingPageForRole(roles[0]);
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(fallbackPath)}`);
  }

  if (!hasRequiredRole(user.role, roles)) {
    redirect(getLandingPageForRole(user.role));
  }

  return user;
}

export const requireAuthenticatedUser = requireAuth;
