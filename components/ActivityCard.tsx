import Image from "next/image";

type ActivityCardProps = {
  title: string;
  city: string;
  category: string;
  price: number;
  image: string;
};

export function ActivityCard({ title, city, category, price, image }: ActivityCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full">
        <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{category}</span>
        </div>
        <p className="text-sm text-slate-500">{city}, Morocco</p>
        <p className="text-sm font-semibold text-slate-900">From {price.toLocaleString("en-US")} MAD</p>
      </div>
    </article>
  );
}
