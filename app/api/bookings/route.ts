import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to book." }, { status: 401 });
  }

  const body = (await request.json()) as {
    activityId?: string;
    scheduleId?: string;
    participants?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
  };

  if (!body.activityId || !body.scheduleId) {
    return NextResponse.json({ error: "Missing activity or schedule selection." }, { status: 400 });
  }

  const participants = Number(body.participants);

  if (!Number.isInteger(participants) || participants < 1 || participants > 20) {
    return NextResponse.json({ error: "Invalid participant count." }, { status: 400 });
  }

  const customerName = body.customerName?.trim();
  const customerEmail = body.customerEmail?.trim();

  if (!customerName || !customerEmail) {
    return NextResponse.json({ error: "Customer name and email are required." }, { status: 400 });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findFirst({
        where: {
          id: body.scheduleId,
          activityId: body.activityId,
          isActive: true,
          date: { gte: new Date() },
        },
        select: {
          id: true,
          activityId: true,
          availableSpots: true,
          price: true,
        },
      });

      if (!schedule) {
        throw new Error("Selected slot is no longer available.");
      }

      if (schedule.availableSpots < participants) {
        throw new Error("Not enough spots available for this slot.");
      }

      const updatedSchedule = await tx.schedule.updateMany({
        where: {
          id: schedule.id,
          availableSpots: { gte: participants },
        },
        data: {
          availableSpots: { decrement: participants },
        },
      });

      if (updatedSchedule.count === 0) {
        throw new Error("Slot availability changed. Please retry.");
      }

      return tx.booking.create({
        data: {
          userId,
          activityId: schedule.activityId,
          scheduleId: schedule.id,
          participants,
          totalPrice: schedule.price.mul(participants),
          status: BookingStatus.PENDING,
          customerName,
          customerEmail,
          customerPhone: body.customerPhone?.trim() || null,
          notes: body.notes?.trim() || null,
        },
      });
    });

    return NextResponse.json({ bookingId: booking.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
