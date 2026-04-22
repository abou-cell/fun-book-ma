import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { roleLandingPage } from "@/lib/auth/constants";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/account")}`);
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(roleLandingPage[role])}`);
  }

  if (user.role !== role) {
    redirect(roleLandingPage[user.role]);
  }

  return user;
}
