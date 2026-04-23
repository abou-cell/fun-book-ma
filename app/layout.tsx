import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { buildDefaultMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/structured-data";

import "./globals.css";

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <JsonLd id="organization-schema" data={buildOrganizationSchema()} />
        <JsonLd id="website-schema" data={buildWebsiteSchema()} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
