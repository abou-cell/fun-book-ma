import { updatePlatformSettingsAction } from "@/lib/admin/actions";
import { ensurePlatformSettings, getAdminMeta } from "@/lib/admin/service";

export default async function AdminSettingsPage() {
  await ensurePlatformSettings();
  const { settings } = await getAdminMeta();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Platform settings</h1>
      <form action={updatePlatformSettingsAction} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
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
