import { PaymentMethod } from "@prisma/client";

import { updatePlatformSettingsAction } from "@/lib/admin/actions";
import { ensurePlatformSettings, getAdminMeta } from "@/lib/admin/service";

const paymentMethods = [PaymentMethod.ONLINE_CARD, PaymentMethod.CASH_ON_SITE, PaymentMethod.PARTIAL_PAYMENT];

export default async function AdminSettingsPage() {
  await ensurePlatformSettings();
  const { settings } = await getAdminMeta();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Platform settings</h1>
      <form action={updatePlatformSettingsAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block text-sm">Default locale<input name="defaultLocale" defaultValue={settings?.defaultLocale ?? "fr"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm">Enabled locales (comma separated)<input name="enabledLocales" defaultValue={settings?.enabledLocales.join(",") ?? "fr,ar,en"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm">Default currency<input name="defaultCurrency" defaultValue={settings?.defaultCurrency ?? "MAD"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm">Support WhatsApp number<input name="supportWhatsappNumber" defaultValue={settings?.supportWhatsappNumber ?? ""} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" placeholder="+212..." /></label>

        <fieldset className="space-y-2 rounded-xl border border-slate-200 p-3">
          <legend className="text-sm font-medium">Enabled payment methods</legend>
          {paymentMethods.map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="enabledPaymentMethods" value={method} defaultChecked={settings?.enabledPaymentMethods.includes(method) ?? false} />
              {method}
            </label>
          ))}
        </fieldset>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="partialPaymentEnabled" defaultChecked={settings?.partialPaymentEnabled ?? false} />Partial payment enabled</label>
        <label className="block text-sm">Deposit percentage (placeholder)<input name="depositPercentage" type="number" min={0} max={100} step={0.01} defaultValue={settings?.depositPercentage ? Number(settings.depositPercentage) : ""} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>

        <label className="block text-sm">Default commission rate (0-1)<input name="defaultCommissionRate" defaultValue={Number(settings?.defaultCommissionRate ?? 0.1)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm">Supported currencies (comma separated)<input name="supportedCurrencies" defaultValue={settings?.supportedCurrencies.join(",") ?? "MAD"} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm">Booking cancellation policy<textarea name="cancellationPolicyDefault" defaultValue={settings?.cancellationPolicyDefault} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="emailNotificationsEnabled" defaultChecked={settings?.emailNotificationsEnabled ?? true} />Email notifications enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="paymentOptionsEnabled" defaultChecked={settings?.paymentOptionsEnabled ?? true} />Payment options enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="maintenanceModeEnabled" defaultChecked={settings?.maintenanceModeEnabled ?? false} />Maintenance mode</label>
        <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Save settings</button>
      </form>
    </div>
  );
}
