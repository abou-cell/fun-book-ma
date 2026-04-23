import { NextResponse } from "next/server";

import { AppError, handleRouteError } from "@/lib/errors/http";
import { logger } from "@/lib/observability/logger";
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
  try {
    const authResult = await requireProviderSession();

    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const payload = await request.json();
    const parsed = activityPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form data", details: parsed.error.flatten() }, { status: 400 });
    }

    const activity = await createProviderActivity(authResult.provider.id, parsed.data);
    logger.info("Provider created activity", { providerId: authResult.provider.id, activityId: activity.id });
    return NextResponse.json({ activityId: activity.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return handleRouteError(new AppError("Slug is already in use", 409, "DUPLICATE_ACTIVITY_SLUG"), {
        route: "/api/provider/activities",
      });
    }

    return handleRouteError(error, {
      route: "/api/provider/activities",
      fallbackMessage: "Unable to create activity",
    });
  }
}
