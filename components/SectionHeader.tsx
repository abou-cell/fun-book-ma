type SectionHeaderProps = {
  title: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function SectionHeader({ title, ctaLabel, ctaHref = "#" }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <a href={ctaHref} className="text-sm font-medium text-brand hover:text-brand-dark">
        {ctaLabel}
      </a>
    </div>
  );
}
