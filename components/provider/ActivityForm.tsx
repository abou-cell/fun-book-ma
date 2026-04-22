"use client";

import { ActivityCategory } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSlug } from "@/lib/provider/validation";

export type ActivityFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  city: string;
  category: ActivityCategory;
  price: number;
  duration: string;
  meetingPoint: string;
  languages: string;
  includedItems: string;
  excludedItems: string;
  cancellationPolicy: string;
  capacity: number;
  isActive: boolean;
};

const defaults: ActivityFormValues = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  city: "",
  category: ActivityCategory.ADVENTURE,
  price: 0,
  duration: "",
  meetingPoint: "",
  languages: "Arabic, French",
  includedItems: "",
  excludedItems: "",
  cancellationPolicy: "Free cancellation up to 24 hours in advance.",
  capacity: 10,
  isActive: true,
};

export function ActivityForm({ mode, activityId, initialValues }: { mode: "create" | "edit"; activityId?: string; initialValues?: Partial<ActivityFormValues> }) {
  const router = useRouter();
  const [form, setForm] = useState<ActivityFormValues>({ ...defaults, ...initialValues });
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endpoint = useMemo(() => (mode === "create" ? "/api/provider/activities" : `/api/provider/activities/${activityId}`), [activityId, mode]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const payload = { ...form, slug: form.slug || createSlug(form.title) };
    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string; activityId?: string };

    if (!response.ok) {
      setStatus(result.error ?? "Unable to save activity");
      setIsSubmitting(false);
      return;
    }

    setStatus(mode === "create" ? "Activity created successfully." : "Activity updated successfully.");
    const id = result.activityId ?? activityId;
    router.push(`/provider/activities/${id}/edit?success=1`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => {
          const title = e.target.value;
          setForm((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : createSlug(title) }));
        }} required />
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Slug" value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((prev) => ({ ...prev, slug: e.target.value })); }} required />
        <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))} required />
        <textarea className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} required />
        <select className="rounded-lg border px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as ActivityCategory }))}>
          {Object.values(ActivityCategory).map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <input type="number" min={1} step="0.01" className="rounded-lg border px-3 py-2 text-sm" placeholder="Price (MAD)" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} required />
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Duration" value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} required />
        <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Meeting point" value={form.meetingPoint} onChange={(e) => setForm((prev) => ({ ...prev, meetingPoint: e.target.value }))} required />
        <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Languages (comma separated)" value={form.languages} onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))} />
        <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Included items (comma separated)" value={form.includedItems} onChange={(e) => setForm((prev) => ({ ...prev, includedItems: e.target.value }))} />
        <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Excluded items (comma separated)" value={form.excludedItems} onChange={(e) => setForm((prev) => ({ ...prev, excludedItems: e.target.value }))} />
        <textarea className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" rows={2} placeholder="Cancellation policy" value={form.cancellationPolicy} onChange={(e) => setForm((prev) => ({ ...prev, cancellationPolicy: e.target.value }))} required />
        <input type="number" min={1} className="rounded-lg border px-3 py-2 text-sm" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} /> Active</label>
      </div>

      {status ? <p className="text-sm text-slate-600">{status}</p> : null}

      <button disabled={isSubmitting} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
        {isSubmitting ? "Saving..." : mode === "create" ? "Create activity" : "Save changes"}
      </button>
    </form>
  );
}
