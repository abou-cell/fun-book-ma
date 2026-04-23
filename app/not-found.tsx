import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-zinc-600">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">
        Back to homepage
      </Link>
    </main>
  );
}
