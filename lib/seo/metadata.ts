import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://funbook.ma";

export const siteConfig = {
  name: "FunBook Morocco",
  shortName: "FunBook",
  description: "Book unforgettable activities across Morocco.",
  locale: "en_US",
} as const;

function normalizeSiteUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL ?? FALLBACK_SITE_URL);
}

export function toAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  images?: { url: string; alt: string }[];
};

export function buildPageMetadata({ title, description, path = "/", keywords, noIndex, images }: BuildMetadataInput): Metadata {
  const canonical = toAbsoluteUrl(path);
  const socialImages = images?.length ? images : [{ url: toAbsoluteUrl("/og-default.jpg"), alt: `${title} | ${siteConfig.name}` }];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImages.map((image) => image.url),
    },
  };
}
