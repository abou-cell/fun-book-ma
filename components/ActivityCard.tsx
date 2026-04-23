import Image from "next/image";
import Link from "next/link";

import { getRequestLocale } from "@/lib/i18n/server";
import { formatCurrency } from "@/lib/localization/format";

export type ActivityCardProps = {
  title: string;
  city: string;
  category: string;
  price: number;
  image: string;
  href?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  shortDescription?: string;
};

export async function ActivityCard({
  title,
  city,
  category,
  price,
  image,
  href,
  rating,
  reviewCount,
  duration,
  shortDescription,
}: ActivityCardProps) {
  const locale = await getRequestLocale();
  const content = (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={70}
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{category}</span>
        </div>
        <p className="text-sm text-slate-500">{city}, Morocco</p>
        {shortDescription ? <p className="line-clamp-2 text-sm text-slate-600">{shortDescription}</p> : null}
        <div className="flex items-center justify-between text-sm text-slate-600">
          {duration ? <span>{duration}</span> : <span>&nbsp;</span>}
          {rating ? (
            <span>
              ⭐ {rating.toFixed(1)} {reviewCount ? `(${reviewCount})` : ""}
            </span>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-slate-900">{formatCurrency(price, locale)}</p>
      </div>
    </article>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
