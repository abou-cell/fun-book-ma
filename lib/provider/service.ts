import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseDateTime } from "@/lib/provider/validation";

type ProviderActivityPayload = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  city: string;
  category: Prisma.ActivityCreateInput["category"];
  price: number;
  duration: string;
  meetingPoint: string;
  languages: string[];
  includedItems: string[];
  excludedItems: string[];
  cancellationPolicy: string;
  capacity?: number;
  isActive: boolean;
};

export async function getProviderByUserId(userId: string) {
  return prisma.provider.findUnique({ where: { userId } });
}

export async function getProviderDashboardData(providerId: string) {
  const now = new Date();

  const [activities, bookings, totalActivities, activeActivities, bookingSummary, upcomingBookings] = await Promise.all([
    prisma.activity.findMany({
      where: { providerId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { bookings: true, schedules: true } } },
    }),
    prisma.booking.findMany({
      where: { activity: { providerId } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        activity: { select: { title: true } },
        schedule: { select: { date: true, startTime: true } },
      },
    }),
    prisma.activity.count({ where: { providerId } }),
    prisma.activity.count({ where: { providerId, isActive: true } }),
    prisma.booking.aggregate({
      where: { activity: { providerId } },
      _count: { _all: true },
      _sum: {
        totalPrice: true,
        commissionAmount: true,
        providerPayoutAmount: true,
      },
    }),
    prisma.booking.count({
      where: {
        activity: { providerId },
        schedule: { startTime: { gte: now } },
        status: { not: BookingStatus.CANCELLED },
      },
    }),
  ]);

  return {
    activities,
    bookings,
    summary: {
      totalActivities,
      activeActivities,
      totalBookings: bookingSummary._count._all,
      upcomingBookings,
      grossRevenue: Number(bookingSummary._sum.totalPrice ?? 0),
      totalCommissions: Number(bookingSummary._sum.commissionAmount ?? 0),
      estimatedPayout: Number(bookingSummary._sum.providerPayoutAmount ?? 0),
    },
  };
}

export function buildActivityDescription(payload: Pick<ProviderActivityPayload, "description" | "meetingPoint" | "languages" | "includedItems" | "excludedItems" | "cancellationPolicy" | "capacity">) {
  return [
    payload.description,
    `Meeting point: ${payload.meetingPoint}`,
    `Languages: ${payload.languages.join(", ")}`,
    `Included: ${payload.includedItems.join(", ")}`,
    `Excluded: ${payload.excludedItems.join(", ")}`,
    `Cancellation policy: ${payload.cancellationPolicy}`,
    `Capacity: ${payload.capacity ?? "N/A"}`,
  ].join("\n\n");
}

export async function createProviderActivity(providerId: string, payload: ProviderActivityPayload) {
  return prisma.activity.create({
    data: {
      providerId,
      title: payload.title,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: buildActivityDescription(payload),
      city: payload.city,
      category: payload.category,
      price: payload.price,
      duration: payload.duration,
      coverImage: "/images/activity-placeholder.jpg",
      isActive: payload.isActive,
    },
  });
}

export async function updateProviderActivity(activityId: string, providerId: string, payload: ProviderActivityPayload) {
  const activity = await prisma.activity.findFirst({ where: { id: activityId, providerId }, select: { id: true } });

  if (!activity) {
    return null;
  }

  return prisma.activity.update({
    where: { id: activityId },
    data: {
      title: payload.title,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: buildActivityDescription(payload),
      city: payload.city,
      category: payload.category,
      price: payload.price,
      duration: payload.duration,
      isActive: payload.isActive,
    },
  });
}

export async function ensureProviderOwnsActivity(activityId: string, providerId: string) {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, providerId },
    select: { id: true, coverImage: true },
  });

  if (!activity) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  return activity;
}

export async function upsertProviderSchedule(providerId: string, payload: {
  scheduleId?: string;
  activityId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSpots?: number;
  price: number;
  isActive: boolean;
}) {
  const activity = await prisma.activity.findFirst({
    where: { id: payload.activityId, providerId },
    select: { id: true },
  });

  if (!activity) {
    throw new Error("Activity not found");
  }

  const date = new Date(payload.date);
  const startTime = parseDateTime(payload.date, payload.startTime);
  const endTime = parseDateTime(payload.date, payload.endTime);

  if (Number.isNaN(date.getTime()) || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
    throw new Error("Invalid schedule date/time");
  }

  if (payload.scheduleId) {
    const existing = await prisma.schedule.findFirst({
      where: { id: payload.scheduleId, activity: { providerId } },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Schedule not found");
    }

    return prisma.schedule.update({
      where: { id: payload.scheduleId },
      data: {
        activityId: payload.activityId,
        date,
        startTime,
        endTime,
        capacity: payload.capacity,
        availableSpots: Math.min(payload.availableSpots ?? payload.capacity, payload.capacity),
        price: payload.price,
        isActive: payload.isActive,
      },
    });
  }

  return prisma.schedule.create({
    data: {
      activityId: payload.activityId,
      date,
      startTime,
      endTime,
      capacity: payload.capacity,
      availableSpots: Math.min(payload.availableSpots ?? payload.capacity, payload.capacity),
      price: payload.price,
      isActive: payload.isActive,
    },
  });
}

export function getProviderBookingWhere(providerId: string) {
  return {
    activity: {
      providerId,
    },
  } satisfies Prisma.BookingWhereInput;
}

export function getPaidStatuses(): PaymentStatus[] {
  return [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED];
}
