import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { createWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({ phone, message, label, floating = false }: { phone?: string | null; message: string; label: string; floating?: boolean }) {
  const href = phone ? createWhatsAppLink(phone, message) : null;
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={floating
        ? "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg"
        : "inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white"}
    >
      <MessageCircle size={18} />
      {label}
    </Link>
  );
}
