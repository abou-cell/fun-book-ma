import { toggleCategoryAction, upsertCategoryAction } from "@/lib/admin/actions";
import { getAdminMeta } from "@/lib/admin/service";

export default async function AdminCategoriesPage() {
  const { categories } = await getAdminMeta();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Categories management</h1>
      <form action={upsertCategoryAction} className="rounded-2xl border border-slate-200 bg-white p-4 grid gap-2 md:grid-cols-5">
        <input name="name" placeholder="Name" className="rounded border border-slate-300 px-2 py-2" />
        <input name="slug" placeholder="Slug" className="rounded border border-slate-300 px-2 py-2" />
        <input name="sortOrder" type="number" defaultValue={0} className="rounded border border-slate-300 px-2 py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked />Active</label>
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Create category</button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{categories.map((category)=><tr key={category.id} className="border-t border-slate-100"><td className="px-4 py-3"><p className="font-medium">{category.name}</p><p className="text-slate-500">{category.slug}</p></td><td className="px-4 py-3">{category.isActive ? "Active" : "Inactive"}</td><td className="px-4 py-3"><form action={toggleCategoryAction}><input type="hidden" name="id" value={category.id} /><button className="rounded border border-slate-300 px-2 py-1">Toggle active</button></form></td></tr>)}</tbody></table></div>
    </div>
  );
}
