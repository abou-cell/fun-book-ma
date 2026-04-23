import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://funbook.ma";
const DEFAULT_OG_IMAGE = "/og-default.jpg";

export const siteConfig = {
  name: "FunBook Morocco",
  shortName: "FunBook",
  description: "Book unforgettable activities across Morocco.",
  locale: "en_US",
  defaultLanguage: "en",
  supportedLanguages: ["en"] as const,
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
  type?: "website" | "article";
};

function buildRobots(noIndex = false): Metadata["robots"] {
  return {
    index: !noIndex,
    follow: !noIndex,
    googleBot: {
      index: !noIndex,
      follow: !noIndex,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords,
  noIndex,
  images,
  type = "website",
}: BuildMetadataInput): Metadata {
  const canonical = toAbsoluteUrl(path);
  const socialImages = images?.length ? images : [{ url: toAbsoluteUrl(DEFAULT_OG_IMAGE), alt: `${title} | ${siteConfig.name}` }];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: Object.fromEntries(siteConfig.supportedLanguages.map((language) => [language, canonical])),
    },
    robots: buildRobots(noIndex),
    openGraph: {
      type,
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
    category: "travel",
  };
}

export function buildDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: "FunBook Morocco | Activity Marketplace",
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.shortName,
    alternates: {
      canonical: "/",
      languages: Object.fromEntries(siteConfig.supportedLanguages.map((language) => [language, "/"])),
    },
    robots: buildRobots(),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      title: "FunBook Morocco | Activity Marketplace",
      description: siteConfig.description,
      siteName: siteConfig.name,
      url: "/",
      images: [{ url: DEFAULT_OG_IMAGE, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FunBook Morocco | Activity Marketplace",
      description: siteConfig.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
