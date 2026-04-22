"use client";

import { useState } from "react";

type ProviderActivity = {
  id: string;
  title: string;
};

type ProviderSchedule = {
  id: string;
  activityTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSpots: number;
  price: number;
  isActive: boolean;
};

type ScheduleManagementProps = {
  activities: ProviderActivity[];
  schedules: ProviderSchedule[];
};

export function ScheduleManagement({ activities, schedules }: ScheduleManagementProps) {
  const [form, setForm] = useState({
    activityId: activities[0]?.id ?? "",
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    capacity: 6,
    price: 300,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSchedule() {
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/provider/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Unable to create schedule");
      setIsSubmitting(false);
      return;
    }

    window.location.reload();
  }

  async function toggleStatus(scheduleId: string, nextValue: boolean) {
    const response = await fetch(`/api/provider/schedules/${scheduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextValue }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Unable to update schedule status");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create schedule</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select
            value={form.activityId}
            onChange={(event) => setForm((prev) => ({ ...prev, activityId: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.title}
              </option>
            ))}
          </select>
          <input type="date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
          <input type="time" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} />
          <input type="time" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} />
          <input type="number" min={1} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))} />
          <input type="number" min={1} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} />
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <button onClick={createSchedule} disabled={isSubmitting || activities.length === 0} className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          {isSubmitting ? "Creating..." : "Add schedule"}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Existing schedules</h2>
        <div className="mt-3 space-y-2">
          {schedules.length === 0 && <p className="text-sm text-slate-500">No schedules yet.</p>}
          {schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-900">{schedule.activityTitle}</p>
              <p className="text-slate-600">
                {new Date(schedule.date).toLocaleDateString()} • {new Date(schedule.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} - {new Date(schedule.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </p>
              <p className="text-slate-600">
                {schedule.availableSpots}/{schedule.capacity} spots • {schedule.price} MAD
              </p>
              <button
                type="button"
                onClick={() => toggleStatus(schedule.id, !schedule.isActive)}
                className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {schedule.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
