import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { createProviderActivity, getProviderBookingWhere } from "@/lib/provider/service";
import { activityPayloadSchema } from "@/lib/provider/validation";

export async function GET() {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const activities = await prisma.activity.findMany({
    where: { providerId: authResult.provider.id },
    include: {
      _count: { select: { schedules: true, bookings: true, images: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const bookingCounts = await prisma.booking.groupBy({
    by: ["activityId"],
    where: getProviderBookingWhere(authResult.provider.id),
    _count: { _all: true },
  });

  const countsMap = new Map(bookingCounts.map((item) => [item.activityId, item._count._all]));

  return NextResponse.json({
    activities: activities.map((activity) => ({
      ...activity,
      bookingCount: countsMap.get(activity.id) ?? 0,
    })),
  });
}

export async function POST(request: Request) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const payload = await request.json();
  const parsed = activityPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const activity = await createProviderActivity(authResult.provider.id, parsed.data);
    return NextResponse.json({ activityId: activity.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug is already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to create activity" }, { status: 500 });
  }
}
