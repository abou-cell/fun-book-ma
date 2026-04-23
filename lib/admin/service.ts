import {
  ActivityModerationStatus,
  PaymentStatus,
  Prisma,
  ProviderStatus,
  RefundStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const toNumber = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

export async function getAdminDashboardData() {
  const [
    users,
    providers,
    pendingProviders,
    activities,
    pendingActivities,
    bookings,
    refunds,
    recentBookings,
    recentProviderSignups,
    recentPendingActivities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.provider.count({ where: { status: ProviderStatus.PENDING } }),
    prisma.activity.count(),
    prisma.activity.count({ where: { status: ActivityModerationStatus.PENDING_REVIEW } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { activity: { select: { title: true, provider: { select: { businessName: true } } } } },
    }),
    prisma.refund.findMany(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { activity: { select: { title: true } } },
    }),
    prisma.provider.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.activity.findMany({
      where: { status: ActivityModerationStatus.PENDING_REVIEW },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { provider: { select: { businessName: true } } },
    }),
  ]);

  const financials = bookings.reduce(
    (acc, booking) => {
      acc.gross += toNumber(booking.totalPrice);
      acc.commissions += toNumber(booking.commissionAmount);
      acc.payouts += toNumber(booking.providerPayoutAmount);
      return acc;
    },
    { gross: 0, commissions: 0, payouts: 0 },
  );

  const refundTotal = refunds.reduce((acc, item) => acc + toNumber(item.amount), 0);

  return {
    metrics: {
      users,
      providers,
      pendingProviders,
      activities,
      pendingActivities,
      totalBookings: bookings.length,
      grossRevenue: financials.gross,
      totalCommissions: financials.commissions,
      estimatedProviderPayouts: financials.payouts,
      totalRefunds: refundTotal,
    },
    recentBookings,
    recentProviderSignups,
    recentPendingActivities,
  };
}

export async function getProviders(status?: ProviderStatus) {
  return prisma.provider.findMany({
    where: status ? { status } : undefined,
    include: { user: true, _count: { select: { activities: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProviderDetail(id: string) {
  return prisma.provider.findUnique({
    where: { id },
    include: {
      user: true,
      activities: { select: { id: true, title: true, status: true, createdAt: true } },
      _count: { select: { activities: true } },
    },
  });
}

export async function getActivities(filters: {
  status?: ActivityModerationStatus;
  city?: string;
  category?: string;
  providerId?: string;
}) {
  return prisma.activity.findMany({
    where: {
      status: filters.status,
      city: filters.city || undefined,
      category: filters.category as never,
      providerId: filters.providerId,
    },
    include: { provider: { select: { businessName: true } }, _count: { select: { bookings: true, schedules: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivityDetail(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      provider: { include: { user: true } },
      images: true,
      _count: { select: { schedules: true, bookings: true } },
    },
  });
}

export async function getBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      activity: { select: { title: true, city: true, provider: { select: { id: true, businessName: true } } } },
      schedule: true,
      user: { select: { email: true, name: true } },
      refunds: true,
    },
  });
}

export async function getPayments() {
  return prisma.payment.findMany({
    include: {
      booking: {
        select: {
          customerEmail: true,
          activity: { select: { title: true, provider: { select: { businessName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCommissionOverview() {
  const [setting, bookings, providerTotals] = await Promise.all([
    prisma.platformSetting.findUnique({ where: { id: 1 } }),
    prisma.booking.findMany({ include: { activity: { select: { provider: { select: { id: true, businessName: true } } } } } }),
    prisma.provider.findMany({ select: { id: true, businessName: true, commissionRate: true, customCommissionEnabled: true } }),
  ]);

  const totals = bookings.reduce(
    (acc, booking) => {
      acc.commissions += toNumber(booking.commissionAmount);
      acc.payouts += toNumber(booking.providerPayoutAmount);
      return acc;
    },
    { commissions: 0, payouts: 0 },
  );

  const perProvider = providerTotals.map((provider) => {
    const providerBookings = bookings.filter((booking) => booking.activity.provider.id === provider.id);
    const commissionTotal = providerBookings.reduce((acc, item) => acc + toNumber(item.commissionAmount), 0);
    const payoutTotal = providerBookings.reduce((acc, item) => acc + toNumber(item.providerPayoutAmount), 0);
    return { provider, bookings: providerBookings.length, commissionTotal, payoutTotal };
  });

  return {
    setting,
    perBooking: bookings,
    perProvider,
    totals,
  };
}

export async function getRefunds() {
  return prisma.refund.findMany({
    include: {
      booking: {
        include: {
          activity: { select: { title: true, provider: { select: { businessName: true } } } },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getAdminMeta() {
  const [categories, cities, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.city.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.platformSetting.findUnique({ where: { id: 1 } }),
  ]);

  return { categories, cities, settings };
}

export async function logAdminAction(data: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  notes?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.adminActionLog.create({ data });
}

export function normalizePaymentStatus(status: string) {
  return Object.values(PaymentStatus).includes(status as PaymentStatus) ? (status as PaymentStatus) : undefined;
}

export function normalizeRefundStatus(status: string) {
  return Object.values(RefundStatus).includes(status as RefundStatus) ? (status as RefundStatus) : undefined;
}

export function normalizeProviderStatus(status: string) {
  return Object.values(ProviderStatus).includes(status as ProviderStatus) ? (status as ProviderStatus) : undefined;
}

export function normalizeActivityStatus(status: string) {
  return Object.values(ActivityModerationStatus).includes(status as ActivityModerationStatus)
    ? (status as ActivityModerationStatus)
    : undefined;
}

export async function ensurePlatformSettings() {
  await prisma.platformSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

export async function getProviderOptions() {
  return prisma.provider.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: "asc" } });
}

export async function getCityOptions() {
  const [activityCities, cities] = await Promise.all([
    prisma.activity.findMany({ distinct: ["city"], select: { city: true }, orderBy: { city: "asc" } }),
    prisma.city.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  return Array.from(new Set([...activityCities.map((item) => item.city), ...cities.map((item) => item.name)]));
}

export async function getProviderSignupUsers() {
  return prisma.user.count({ where: { role: UserRole.PROVIDER } });
}
