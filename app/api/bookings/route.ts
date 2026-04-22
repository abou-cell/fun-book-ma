import { BookingStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { bookingRequestSchema } from "@/lib/booking/validation";
import { sendBookingCreatedEmails } from "@/lib/email/booking-notifications";
import { calculateCheckoutAmounts } from "@/lib/financials/commission";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to book." }, { status: 401 });
  }

  const parsedBody = bookingRequestSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.issues[0]?.message ?? "Invalid booking request." }, { status: 400 });
  }

  const payload = parsedBody.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findFirst({
        where: {
          id: payload.scheduleId,
          activityId: payload.activityId,
          isActive: true,
          startTime: { gte: new Date() },
        },
        select: {
          id: true,
          activityId: true,
          availableSpots: true,
          price: true,
          activity: {
            select: {
              title: true,
              provider: {
                select: {
                  commissionRate: true,
                  user: { select: { email: true } },
                },
              },
            },
          },
        },
      });

      if (!schedule) {
        throw new Error("Selected slot is no longer available.");
      }

      if (schedule.availableSpots < payload.participants) {
        throw new Error("Not enough spots available for this slot.");
      }

      const updatedSchedule = await tx.schedule.updateMany({
        where: {
          id: schedule.id,
          availableSpots: { gte: payload.participants },
        },
        data: {
          availableSpots: { decrement: payload.participants },
        },
      });

      if (updatedSchedule.count === 0) {
        throw new Error("Slot availability changed. Please retry.");
      }

      const subtotal = Number(schedule.price.mul(payload.participants));
      const { commissionAmount, providerPayoutAmount, total, serviceFee } = calculateCheckoutAmounts(
        subtotal,
        null,
        Number(schedule.activity.provider.commissionRate),
      );

      return tx.booking.create({
        data: {
          userId,
          activityId: schedule.activityId,
          scheduleId: schedule.id,
          participants: payload.participants,
          totalPrice: total,
          subtotal,
          serviceFee: serviceFee > 0 ? serviceFee : null,
          commissionAmount,
          providerPayoutAmount,
          paymentStatus: PaymentStatus.UNPAID,
          status: BookingStatus.PENDING,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerPhone: payload.customerPhone,
          notes: payload.notes,
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          totalPrice: true,
          activity: {
            select: {
              title: true,
              provider: { select: { user: { select: { email: true } } } },
            },
          },
        },
      });
    });

    void sendBookingCreatedEmails({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      providerEmail: booking.activity.provider.user.email,
      bookingId: booking.id,
      activityTitle: booking.activity.title,
      amount: Number(booking.totalPrice),
    });

    return NextResponse.json({ bookingId: booking.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
