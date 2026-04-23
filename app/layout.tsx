import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { buildOrganizationSchema } from "@/lib/seo/structured-data";
import { getSiteUrl, siteConfig } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "FunBook Morocco | Activity Marketplace",
    template: "%s | FunBook Morocco",
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    title: "FunBook Morocco | Activity Marketplace",
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "FunBook Morocco | Activity Marketplace",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <JsonLd id="organization-schema" data={buildOrganizationSchema()} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
