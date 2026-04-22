import { ProviderEmptyState } from "@/components/provider/ProviderEmptyState";
import { ActivityForm } from "@/components/provider/ActivityForm";
import { ActivityImageUploader } from "@/components/provider/ActivityImageUploader";
import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProviderByUserId } from "@/lib/provider/service";

type Props = { params: Promise<{ id: string }> };

function extractSegment(description: string, key: string) {
  const line = description.split("\n").find((item) => item.startsWith(`${key}:`));
  return line?.replace(`${key}:`, "").trim() ?? "";
}

export default async function EditProviderActivityPage({ params }: Props) {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);
  if (!provider) return <ProviderEmptyState title="No provider profile" description="Provider account not found." />;

  const { id } = await params;
  const activity = await prisma.activity.findFirst({ where: { id, providerId: provider.id }, include: { images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } });

  if (!activity) return <ProviderEmptyState title="Activity not found" description="This activity does not exist or you do not have access." />;

  return (
    <>
      <ProviderHeader title="Edit activity" description="Update your listing details, media, and publication status." />
      <ActivityForm
        mode="edit"
        activityId={activity.id}
        initialValues={{
          title: activity.title,
          slug: activity.slug,
          shortDescription: activity.shortDescription,
          description: activity.description.split("\n\nMeeting point:")[0] ?? activity.description,
          city: activity.city,
          category: activity.category,
          price: Number(activity.price),
          duration: activity.duration,
          meetingPoint: extractSegment(activity.description, "Meeting point"),
          languages: extractSegment(activity.description, "Languages"),
          includedItems: extractSegment(activity.description, "Included"),
          excludedItems: extractSegment(activity.description, "Excluded"),
          cancellationPolicy: extractSegment(activity.description, "Cancellation policy"),
          capacity: Number(extractSegment(activity.description, "Capacity") || 10),
          isActive: activity.isActive,
        }}
      />
      <ActivityImageUploader activityId={activity.id} images={activity.images} />
    </>
  );
}
