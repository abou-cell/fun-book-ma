import { getRequestLocale } from "@/lib/i18n/server";
import { formatCurrency } from "@/lib/localization/format";

export async function LocalizedPrice({ value }: { value: number }) {
  const locale = await getRequestLocale();
  return <>{formatCurrency(value, locale)}</>;
}
