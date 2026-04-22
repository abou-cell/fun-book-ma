"use client";

import { useState } from "react";

export function SettingsForm({ initialValues }: { initialValues: {
  businessName: string;
  city: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  commissionRate: string;
} }) {
  const [form, setForm] = useState(initialValues);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/provider/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setStatus(response.ok ? "Settings updated." : "Unable to update settings.");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <input className="rounded-lg border px-3 py-2 text-sm" value={form.businessName} onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))} />
      <input className="rounded-lg border px-3 py-2 text-sm" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
      <textarea className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
      <input className="rounded-lg border px-3 py-2 text-sm" value={form.phone} placeholder="Phone" onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
      <input className="rounded-lg border px-3 py-2 text-sm" value={form.whatsapp} placeholder="WhatsApp" onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} />
      <input className="rounded-lg border px-3 py-2 text-sm" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
      <input className="rounded-lg border bg-slate-100 px-3 py-2 text-sm" value={`${Number(form.commissionRate) * 100}%`} readOnly />
      {status ? <p className="text-sm text-slate-600 sm:col-span-2">{status}</p> : null}
      <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Save settings</button>
    </form>
  );
}
