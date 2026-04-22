import Link from "next/link";

export function ProviderEmptyState({ title, description, ctaHref, ctaLabel }: { title: string; description: string; ctaHref?: string; ctaLabel?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white" href={ctaHref}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
