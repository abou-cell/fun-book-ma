import { BookingStatus, PaymentStatus } from "@prisma/client";

import { BookingTable } from "@/components/provider/BookingTable";
import { ProviderHeader } from "@/components/provider/ProviderHeader";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProviderByUserId } from "@/lib/provider/service";

export default async function ProviderBookingsPage({ searchParams }: { searchParams: Promise<{ range?: string; payment?: string; status?: string }> }) {
  const user = await requireRole("PROVIDER");
  const provider = await getProviderByUserId(user.id);
  if (!provider) return null;

  const params = await searchParams;
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      activity: { providerId: provider.id },
      ...(params.range === "upcoming" ? { schedule: { startTime: { gte: now } } } : {}),
      ...(params.range === "past" ? { schedule: { startTime: { lt: now } } } : {}),
      ...(params.payment ? { paymentStatus: params.payment as PaymentStatus } : {}),
      ...(params.status ? { status: params.status as BookingStatus } : {}),
    },
    include: { activity: { select: { title: true } }, schedule: { select: { startTime: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <ProviderHeader title="Bookings" description="Review participant info, payment state, and payout amounts." />
      <BookingTable bookings={bookings.map((booking) => ({
        id: booking.id,
        customerName: booking.customerName,
        participants: booking.participants,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        providerPayoutAmount: Number(booking.providerPayoutAmount),
        activityTitle: booking.activity.title,
        dateTime: booking.schedule.startTime,
      }))} />
    </>
  );
}
