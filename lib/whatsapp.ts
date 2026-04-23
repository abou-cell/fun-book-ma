export function normalizeWhatsappNumber(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return digits;
}

export function createWhatsAppLink(phone: string, message: string) {
  const normalized = normalizeWhatsappNumber(phone);
  if (!normalized) return null;

  const text = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${text}`;
}
