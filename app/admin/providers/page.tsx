import Link from "next/link";
import { ProviderStatus } from "@prisma/client";

import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { ProviderStatusBadge } from "@/components/admin/ProviderStatusBadge";
import { updateProviderStatusAction } from "@/lib/admin/actions";
import { getProviders, normalizeProviderStatus } from "@/lib/admin/service";

export default async function AdminProvidersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = normalizeProviderStatus(params.status ?? "");
  const providers = await getProviders(status);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Provider validations</h1>
      <AdminTableFilters>
        <form className="md:col-span-3 flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">Status</label>
          <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All</option>
            {Object.values(ProviderStatus).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Apply</button>
        </form>
      </AdminTableFilters>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3"><p className="font-medium text-slate-900">{provider.businessName}</p><p className="text-slate-500">{provider.user.email}</p></td>
                <td className="px-4 py-3 text-slate-700">{provider.city}</td>
                <td className="px-4 py-3"><ProviderStatusBadge status={provider.status} /></td>
                <td className="px-4 py-3 space-y-2">
                  <Link href={`/admin/providers/${provider.id}`} className="inline-block rounded border border-slate-300 px-2 py-1">View</Link>
                  <form action={updateProviderStatusAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="providerId" value={provider.id} />
                    <select name="status" defaultValue={provider.status} className="rounded border border-slate-300 px-2 py-1">
                      {Object.values(ProviderStatus).map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <input name="reason" placeholder="Reason" className="rounded border border-slate-300 px-2 py-1" />
                    <button className="rounded bg-slate-900 px-2 py-1 text-white">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
