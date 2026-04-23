"use client";

import { UserRole } from "@prisma/client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { getLandingPageForRole } from "@/lib/auth/constants";
import { useCurrentLocale, withCurrentLocalePath } from "@/lib/i18n/client";

type AuthMode = "login" | "signup";

type Props = {
  mode: AuthMode;
};

const roleOptions = [
  { value: "CLIENT", label: "Client" },
  { value: "PROVIDER", label: "Provider" },
] as const;

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "CLIENT") as UserRole;

    setIsLoading(true);
    setError(null);

    try {
      if (!isLogin) {
        const signupResponse = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        const signupData = (await signupResponse.json()) as { error?: string };

        if (!signupResponse.ok) {
          throw new Error(signupData.error ?? "Unable to create account");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      const redirectTo = searchParams.get("redirectTo");

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      router.push(withCurrentLocalePath(locale, isLogin ? getLandingPageForRole() : getLandingPageForRole(role)));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{isLogin ? "Welcome back" : "Create an account"}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isLogin ? "Sign in to manage your bookings and dashboards." : "Join FunBook and start booking or hosting experiences."}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {!isLogin && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-4"
              placeholder="Your name"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-4"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-4"
            placeholder="••••••••"
          />
          {!isLogin && <p className="mt-1 text-xs text-slate-500">At least 8 chars with uppercase, lowercase, and number.</p>}
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
              I am joining as
            </label>
            <select
              id="role"
              name="role"
              defaultValue="CLIENT"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-4"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <Link href={withCurrentLocalePath(locale, isLogin ? "/signup" : "/login")} className="font-medium text-brand hover:underline">
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
