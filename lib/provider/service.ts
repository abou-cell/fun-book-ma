import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseDateTime } from "@/lib/provider/validation";

export async function getProviderByUserId(userId: string) {
  return prisma.provider.findUnique({ where: { userId } });
}

export async function getProviderDashboardData(providerId: string) {
  const [activities, bookings] = await Promise.all([
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
  ]);

  const now = new Date();
  const totals = bookings.reduce(
    (acc, booking) => {
      acc.totalBookings += 1;
      acc.grossRevenue += Number(booking.totalPrice);
      acc.totalCommissions += Number(booking.commissionAmount);
      acc.estimatedPayout += Number(booking.providerPayoutAmount);
      if (booking.schedule.startTime >= now && booking.status !== BookingStatus.CANCELLED) {
        acc.upcomingBookings += 1;
      }
      return acc;
    },
    {
      totalBookings: 0,
      upcomingBookings: 0,
      grossRevenue: 0,
      totalCommissions: 0,
      estimatedPayout: 0,
    },
  );

  return {
    activities,
    bookings,
    summary: {
      totalActivities: activities.length,
      activeActivities: activities.filter((activity) => activity.isActive).length,
      ...totals,
    },
  };
}

export async function createProviderActivity(providerId: string, payload: {
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
}) {
  return prisma.activity.create({
    data: {
      providerId,
      title: payload.title,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: `${payload.description}\n\nMeeting point: ${payload.meetingPoint}\nLanguages: ${payload.languages.join(", ")}\nIncluded: ${payload.includedItems.join(", ")}\nExcluded: ${payload.excludedItems.join(", ")}\nCancellation policy: ${payload.cancellationPolicy}\nCapacity: ${payload.capacity ?? "N/A"}`,
      city: payload.city,
      category: payload.category,
      price: payload.price,
      duration: payload.duration,
      coverImage: "/images/activity-placeholder.jpg",
      isActive: payload.isActive,
    },
  });
}

export async function updateProviderActivity(activityId: string, providerId: string, payload: Parameters<typeof createProviderActivity>[1]) {
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
      description: `${payload.description}\n\nMeeting point: ${payload.meetingPoint}\nLanguages: ${payload.languages.join(", ")}\nIncluded: ${payload.includedItems.join(", ")}\nExcluded: ${payload.excludedItems.join(", ")}\nCancellation policy: ${payload.cancellationPolicy}\nCapacity: ${payload.capacity ?? "N/A"}`,
      city: payload.city,
      category: payload.category,
      price: payload.price,
      duration: payload.duration,
      isActive: payload.isActive,
    },
  });
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
