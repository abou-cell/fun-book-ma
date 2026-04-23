"use client";

import { useEffect } from "react";

import { captureException } from "@/lib/observability/monitoring";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <html>
      <body className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-zinc-600">An unexpected error occurred. Please try again.</p>
        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
