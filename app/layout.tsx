import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunBook Morocco | Activity Marketplace",
  description: "Book unforgettable activities across Morocco.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
