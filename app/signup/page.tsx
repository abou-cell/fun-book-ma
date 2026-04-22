import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth/current-user";
import { roleLandingPage } from "@/lib/auth/constants";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(roleLandingPage[user.role]);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <section className="mx-auto flex max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <AuthForm mode="signup" />
        </div>
      </section>
    </main>
  );
}
