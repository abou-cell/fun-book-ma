import { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "funbook_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const roleLandingPage: Record<UserRole, string> = {
  CLIENT: "/account",
  PROVIDER: "/provider/dashboard",
  ADMIN: "/admin/dashboard",
};
