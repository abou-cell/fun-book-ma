import { ScheduleForm } from "@/components/provider/ScheduleForm";
import { ProviderEmptyState } from "@/components/provider/ProviderEmptyState";
import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProviderByUserId } from "@/lib/provider/service";

export default async function ProviderSchedulesPage() {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);
  if (!provider) return null;

  const [activities, schedules] = await Promise.all([
    prisma.activity.findMany({ where: { providerId: provider.id }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.schedule.findMany({ where: { activity: { providerId: provider.id } }, include: { activity: { select: { title: true } } }, orderBy: [{ date: "asc" }, { startTime: "asc" }] }),
  ]);

  return (
    <>
      <ProviderHeader title="Schedules" description="Add and update departure times, capacity, and active status." />
      {activities.length === 0 ? <ProviderEmptyState title="Create an activity first" description="Schedules can be added after your first listing is published." ctaHref="/provider/activities/new" ctaLabel="Create activity" /> : <ScheduleForm activities={activities} />}
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <ScheduleForm
            key={schedule.id}
            activities={activities}
            scheduleId={schedule.id}
            initialValues={{
              activityId: schedule.activityId,
              date: schedule.date.toISOString().slice(0, 10),
              startTime: schedule.startTime.toISOString().slice(11, 16),
              endTime: schedule.endTime.toISOString().slice(11, 16),
              capacity: schedule.capacity,
              availableSpots: schedule.availableSpots,
              price: Number(schedule.price),
              isActive: schedule.isActive,
            }}
          />
        ))}
      </div>
    </>
  );
}
