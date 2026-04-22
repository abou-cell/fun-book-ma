import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });

  if (!provider) {
    return NextResponse.json({ error: "Provider account required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    activityId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    price?: number;
  };

  if (!body.activityId || !body.date || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const capacity = Number(body.capacity);
  const price = Number(body.price);

  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
    return NextResponse.json({ error: "Invalid capacity" }, { status: 400 });
  }

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const activity = await prisma.activity.findFirst({
    where: {
      id: body.activityId,
      providerId: provider.id,
    },
    select: { id: true },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const date = new Date(body.date);
  const startTime = new Date(`${body.date}T${body.startTime}:00`);
  const endTime = new Date(`${body.date}T${body.endTime}:00`);

  if (Number.isNaN(date.getTime()) || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
    return NextResponse.json({ error: "Invalid date/time range" }, { status: 400 });
  }

  const schedule = await prisma.schedule.create({
    data: {
      activityId: activity.id,
      date,
      startTime,
      endTime,
      capacity,
      availableSpots: capacity,
      price,
      isActive: true,
    },
  });

  return NextResponse.json({ scheduleId: schedule.id }, { status: 201 });
}
