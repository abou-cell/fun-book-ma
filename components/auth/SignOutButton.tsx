"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-slate-300 hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}
