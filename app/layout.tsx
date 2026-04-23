import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getRequestLocale } from "@/lib/i18n/server";
import { localeMeta } from "@/lib/i18n/config";
import { buildDefaultMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/structured-data";

import "./globals.css";

export const metadata: Metadata = buildDefaultMetadata();

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const meta = localeMeta[locale];

  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning>
      <body>
        <JsonLd id="organization-schema" data={buildOrganizationSchema()} />
        <JsonLd id="website-schema" data={buildWebsiteSchema()} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <WhatsAppButton
          phone={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}
          message="Bonjour, j'ai besoin d'aide avec ma réservation FunBook Maroc."
          label="WhatsApp"
          floating
        />
      </body>
    </html>
  );
}
