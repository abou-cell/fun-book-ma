import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  subtitle?: string;
};

export function SectionHeader({ title, ctaLabel, ctaHref = "#", subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {ctaLabel ? (
        <Link href={ctaHref} className="text-sm font-medium text-brand hover:text-brand-dark">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
