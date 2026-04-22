import Link from "next/link";

export function ProviderHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Provider dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <Link href="/provider/activities/new" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
          New activity
        </Link>
      </div>
    </div>
  );
}
