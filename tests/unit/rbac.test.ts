import { UserRole } from "@prisma/client";

import { canAccessRoute, getLandingPageForRole } from "@/lib/auth/rbac";

describe("rbac route protection", () => {
  it("enforces admin and provider scopes", () => {
    expect(canAccessRoute("/admin/dashboard", UserRole.ADMIN)).toBe(true);
    expect(canAccessRoute("/admin/dashboard", UserRole.PROVIDER)).toBe(false);
    expect(canAccessRoute("/provider/dashboard", UserRole.PROVIDER)).toBe(true);
    expect(canAccessRoute("/provider/dashboard", UserRole.CLIENT)).toBe(false);
  });

  it("returns role landing pages", () => {
    expect(getLandingPageForRole(UserRole.CLIENT)).toBe("/account");
    expect(getLandingPageForRole(UserRole.PROVIDER)).toBe("/provider/dashboard");
  });
});
