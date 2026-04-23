import { ActivityModerationStatus } from "@prisma/client";

export function ActivityModerationActions({
  id,
  status,
  action,
}: {
  id: string;
  status: ActivityModerationStatus;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex flex-wrap gap-2">
      <input type="hidden" name="activityId" value={id} />
      <select name="status" defaultValue={status} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {Object.values(ActivityModerationStatus).map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="reason"
        placeholder="Optional reason"
        className="min-w-60 rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Update</button>
    </form>
  );
}
