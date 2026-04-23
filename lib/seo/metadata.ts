import type { Metadata } from "next";

import { defaultLocale, locales } from "@/lib/i18n/config";

const FALLBACK_SITE_URL = "https://funbook.ma";
const DEFAULT_OG_IMAGE = "/og-default.jpg";

const localizedMeta = {
  fr: { description: "Réservez des activités inoubliables partout au Maroc.", ogLocale: "fr_MA" },
  ar: { description: "احجز أنشطة وتجارب مميزة في جميع أنحاء المغرب.", ogLocale: "ar_MA" },
  en: { description: "Book unforgettable activities across Morocco.", ogLocale: "en_MA" },
} as const;

export const siteConfig = {
  name: "FunBook Morocco",
  shortName: "FunBook",
  defaultLanguage: defaultLocale,
  supportedLanguages: locales,
} as const;

function normalizeSiteUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL ?? FALLBACK_SITE_URL);
}

export function toAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
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

function buildLanguageAlternates(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return Object.fromEntries(locales.map((locale) => [locale, `/${locale}${cleanPath === "/" ? "" : cleanPath}`]));
}

function buildRobots(noIndex = false): Metadata["robots"] {
  return {
    index: !noIndex,
    follow: !noIndex,
    googleBot: { index: !noIndex, follow: !noIndex, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  };
}

export function buildPageMetadata({ title, description, path = "/", keywords, noIndex, images, type = "website" }: BuildMetadataInput): Metadata {
  const canonical = toAbsoluteUrl(`/${defaultLocale}${path === "/" ? "" : path}`);
  const socialImages = images?.length ? images : [{ url: toAbsoluteUrl(DEFAULT_OG_IMAGE), alt: `${title} | ${siteConfig.name}` }];

  return {
    title,
    description,
    keywords,
    alternates: { canonical, languages: buildLanguageAlternates(path) },
    robots: buildRobots(noIndex),
    openGraph: {
      type,
      locale: localizedMeta[defaultLocale].ogLocale,
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
    title: { default: "FunBook Morocco | Marketplace Maroc", template: `%s | ${siteConfig.name}` },
    description: localizedMeta[defaultLocale].description,
    applicationName: siteConfig.shortName,
    alternates: { canonical: `/${defaultLocale}`, languages: buildLanguageAlternates("/") },
    robots: buildRobots(),
    openGraph: {
      type: "website",
      locale: localizedMeta[defaultLocale].ogLocale,
      title: "FunBook Morocco | Marketplace Maroc",
      description: localizedMeta[defaultLocale].description,
      siteName: siteConfig.name,
      url: `/${defaultLocale}`,
      images: [{ url: DEFAULT_OG_IMAGE, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FunBook Morocco | Marketplace Maroc",
      description: localizedMeta[defaultLocale].description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
