import { type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";

type NavbarPageLayoutProps = {
  children: ReactNode;
  mainClassName?: string;
  sectionClassName?: string;
};

export function NavbarPageLayout({ children, mainClassName, sectionClassName }: NavbarPageLayoutProps) {
  return (
    <main className={cn("min-h-screen pb-16", mainClassName)}>
      <Navbar />
      <section className={sectionClassName}>{children}</section>
    </main>
  );
}
