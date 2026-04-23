import { siteConfig, toAbsoluteUrl } from "@/lib/seo/metadata";
import { getTrustedAggregateRating } from "@/lib/reviews/validation";

type SchemaBase = {
  "@context": "https://schema.org";
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: toAbsoluteUrl("/"),
    logo: toAbsoluteUrl("/logo.png"),
  } as const satisfies SchemaBase;
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: toAbsoluteUrl("/"),
    inLanguage: siteConfig.defaultLanguage,
    potentialAction: {
      "@type": "SearchAction",
      target: `${toAbsoluteUrl("/activities")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const satisfies SchemaBase;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  } as const satisfies SchemaBase;
}

type ActivitySchemaInput = {
  title: string;
  description: string;
  slug: string;
  imageUrls: string[];
  city: string;
  duration: string;
  price: number;
  providerName: string;
  rating: number;
  reviewCount: number;
};

export function buildActivityStructuredData(input: ActivitySchemaInput) {
  const aggregateRating = getTrustedAggregateRating({
    rating: input.rating,
    reviewCount: input.reviewCount,
  });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: input.description,
    image: input.imageUrls,
    category: "TravelActivity",
    brand: {
      "@type": "Brand",
      name: input.providerName,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: input.price,
      availability: "https://schema.org/InStock",
      url: toAbsoluteUrl(`/activities/${input.slug}`),
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.rating.toFixed(1),
            reviewCount: aggregateRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "City",
        value: input.city,
      },
      {
        "@type": "PropertyValue",
        name: "Duration",
        value: input.duration,
      },
    ],
  } as const satisfies SchemaBase;
}

type ActivityListItem = {
  title: string;
  slug: string;
  image: string;
  price: number;
};

export function buildActivitiesItemListSchema(items: ActivityListItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/activities/${item.slug}`),
      item: {
        "@type": "Product",
        name: item.title,
        image: toAbsoluteUrl(item.image),
        offers: {
          "@type": "Offer",
          priceCurrency: "MAD",
          price: item.price,
        },
      },
    })),
  } as const satisfies SchemaBase;
}
