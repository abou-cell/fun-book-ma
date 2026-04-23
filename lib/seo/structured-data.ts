import { siteConfig, toAbsoluteUrl } from "@/lib/seo/metadata";
import { getTrustedAggregateRating } from "@/lib/reviews/validation";

type OrganizationSchema = {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
};

export function buildOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: toAbsoluteUrl("/"),
    logo: toAbsoluteUrl("/logo.png"),
  };
}

type BreadcrumbListSchema = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
};

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
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
  };
}
