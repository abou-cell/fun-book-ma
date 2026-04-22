import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { NavbarPageLayout } from "@/components/layout/NavbarPageLayout";
import { getCurrentUser } from "@/lib/auth/current-user";
import { roleLandingPage } from "@/lib/auth/constants";

type AuthPageShellProps = {
  mode: "login" | "signup";
};

export async function AuthPageShell({ mode }: AuthPageShellProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(roleLandingPage[user.role]);
  }

  return (
    <NavbarPageLayout
      mainClassName="bg-slate-50"
      sectionClassName="mx-auto flex max-w-6xl px-4 pt-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-md">
        <AuthForm mode={mode} />
      </div>
    </NavbarPageLayout>
  );
}
