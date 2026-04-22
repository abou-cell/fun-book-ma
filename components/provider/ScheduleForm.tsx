"use client";

import { useState } from "react";

type ActivityOption = { id: string; title: string };

type ScheduleFormValues = {
  activityId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSpots: number;
  price: number;
  isActive: boolean;
};

export function ScheduleForm({ activities, initialValues, scheduleId }: { activities: ActivityOption[]; initialValues?: Partial<ScheduleFormValues>; scheduleId?: string }) {
  const [form, setForm] = useState<ScheduleFormValues>({
    activityId: initialValues?.activityId ?? activities[0]?.id ?? "",
    date: initialValues?.date ?? "",
    startTime: initialValues?.startTime ?? "09:00",
    endTime: initialValues?.endTime ?? "11:00",
    capacity: initialValues?.capacity ?? 10,
    availableSpots: initialValues?.availableSpots ?? 10,
    price: initialValues?.price ?? 100,
    isActive: initialValues?.isActive ?? true,
  });
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    const endpoint = scheduleId ? `/api/provider/schedules/${scheduleId}` : "/api/provider/schedules";
    const method = scheduleId ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setStatus("Unable to save schedule.");
      return;
    }

    setStatus("Schedule saved.");
    window.location.reload();
  }

  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <select className="rounded-lg border px-3 py-2 text-sm" value={form.activityId} onChange={(e) => setForm((prev) => ({ ...prev, activityId: e.target.value }))}>
        {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
      </select>
      <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
      <input type="time" className="rounded-lg border px-3 py-2 text-sm" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
      <input type="time" className="rounded-lg border px-3 py-2 text-sm" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
      <input type="number" className="rounded-lg border px-3 py-2 text-sm" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} />
      <input type="number" className="rounded-lg border px-3 py-2 text-sm" value={form.availableSpots} onChange={(e) => setForm((prev) => ({ ...prev, availableSpots: Number(e.target.value) }))} />
      <input type="number" className="rounded-lg border px-3 py-2 text-sm" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} />
      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} /> Active</label>
      {status ? <p className="text-sm text-slate-500 sm:col-span-2">{status}</p> : null}
      <button type="button" onClick={submit} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">{scheduleId ? "Update schedule" : "Add schedule"}</button>
    </div>
  );
}
