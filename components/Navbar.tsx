import Link from "next/link";
import { Menu, Mountain } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTranslator } from "@/lib/i18n/server";

export async function Navbar() {
  const [user, { locale, t }] = await Promise.all([getCurrentUser(), getTranslator()]);
  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={href("/")} className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <span className="rounded-xl bg-brand p-2 text-white">
            <Mountain size={18} />
          </span>
          {t("brandName")}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href={href("/#categories")} className="transition hover:text-slate-900">{t("nav.categories")}</Link>
          <Link href={href("/#popular")} className="transition hover:text-slate-900">{t("nav.popular")}</Link>
          <Link href={href("/activities")} className="transition hover:text-slate-900">{t("nav.activities")}</Link>
          {user ? (
            <>
              <Link href={href("/account")} className="transition hover:text-slate-900">{t("nav.account")}</Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href={href("/login")} className="transition hover:text-slate-900">{t("nav.signIn")}</Link>
              <Link href={href("/signup")} className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-slate-300 hover:bg-slate-100">{t("nav.getStarted")}</Link>
            </>
          )}
          <LanguageSwitcher />
        </nav>

        <button className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-700 md:hidden">
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
