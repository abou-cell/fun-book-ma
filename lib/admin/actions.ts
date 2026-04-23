"use server";

import { ActivityModerationStatus, BookingStatus, ProviderStatus, RefundStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

import { ensurePlatformSettings, logAdminAction } from "./service";

async function getAdmin() {
  return requireRole("ADMIN");
}

function optionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProviderStatusAction(formData: FormData) {
  const admin = await getAdmin();
  const parsed = z
    .object({
      providerId: z.string().min(1),
      status: z.nativeEnum(ProviderStatus),
      reason: z.string().max(500).optional(),
    })
    .safeParse({
      providerId: formData.get("providerId"),
      status: formData.get("status"),
      reason: optionalText(formData.get("reason")),
    });

  if (!parsed.success) return;

  await prisma.provider.update({
    where: { id: parsed.data.providerId },
    data: {
      status: parsed.data.status,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      rejectionReason: parsed.data.status === ProviderStatus.REJECTED ? parsed.data.reason : null,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    action: "PROVIDER_STATUS_UPDATED",
    entityType: "Provider",
    entityId: parsed.data.providerId,
    notes: parsed.data.reason,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/admin/providers");
  revalidatePath(`/admin/providers/${parsed.data.providerId}`);
  revalidatePath("/admin/dashboard");
}

export async function updateActivityStatusAction(formData: FormData) {
  const admin = await getAdmin();
  const parsed = z
    .object({
      activityId: z.string().min(1),
      status: z.nativeEnum(ActivityModerationStatus),
      reason: z.string().max(500).optional(),
    })
    .safeParse({
      activityId: formData.get("activityId"),
      status: formData.get("status"),
      reason: optionalText(formData.get("reason")),
    });

  if (!parsed.success) return;

  await prisma.activity.update({
    where: { id: parsed.data.activityId },
    data: {
      status: parsed.data.status,
      isActive:
        parsed.data.status !== ActivityModerationStatus.REJECTED &&
        parsed.data.status !== ActivityModerationStatus.INACTIVE,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      rejectionReason: parsed.data.status === ActivityModerationStatus.REJECTED ? parsed.data.reason : null,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    action: "ACTIVITY_STATUS_UPDATED",
    entityType: "Activity",
    entityId: parsed.data.activityId,
    notes: parsed.data.reason,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/admin/activities");
  revalidatePath(`/admin/activities/${parsed.data.activityId}`);
  revalidatePath("/admin/dashboard");
}

export async function cancelBookingAction(formData: FormData) {
  const admin = await getAdmin();
  const bookingId = z.string().min(1).parse(formData.get("bookingId"));
  await prisma.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.CANCELLED } });

  await logAdminAction({
    adminUserId: admin.id,
    action: "BOOKING_CANCELLED",
    entityType: "Booking",
    entityId: bookingId,
  });

  revalidatePath("/admin/bookings");
}

export async function markBookingForRefundAction(formData: FormData) {
  const admin = await getAdmin();
  const parsed = z
    .object({
      bookingId: z.string().min(1),
      amount: z.coerce.number().positive(),
      reason: z.string().min(3).max(500),
    })
    .parse({
      bookingId: formData.get("bookingId"),
      amount: formData.get("amount"),
      reason: formData.get("reason"),
    });

  await prisma.refund.create({
    data: {
      bookingId: parsed.bookingId,
      amount: parsed.amount,
      reason: parsed.reason,
      processedBy: admin.id,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    action: "REFUND_REQUESTED",
    entityType: "Booking",
    entityId: parsed.bookingId,
    notes: parsed.reason,
    metadata: { amount: parsed.amount },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/refunds");
  revalidatePath("/admin/dashboard");
}

export async function updateRefundStatusAction(formData: FormData) {
  const admin = await getAdmin();
  const parsed = z
    .object({
      refundId: z.string().min(1),
      status: z.nativeEnum(RefundStatus),
      notes: z.string().max(500).optional(),
    })
    .parse({
      refundId: formData.get("refundId"),
      status: formData.get("status"),
      notes: optionalText(formData.get("notes")),
    });

  await prisma.refund.update({
    where: { id: parsed.refundId },
    data: {
      status: parsed.status,
      notes: parsed.notes,
      processedBy: admin.id,
      processedAt:
        parsed.status === RefundStatus.PROCESSED ||
        parsed.status === RefundStatus.REJECTED ||
        parsed.status === RefundStatus.FAILED
          ? new Date()
          : null,
    },
  });

  revalidatePath("/admin/refunds");
  revalidatePath("/admin/bookings");
}

export async function upsertCategoryAction(formData: FormData) {
  await getAdmin();
  const parsed = z
    .object({
      id: z.string().optional(),
      name: z.string().min(2).max(80),
      slug: z.string().min(2).max(80),
      sortOrder: z.coerce.number().int().min(0).default(0),
      isActive: z.boolean().default(true),
    })
    .parse({
      id: optionalText(formData.get("id")) ?? undefined,
      name: formData.get("name"),
      slug: formData.get("slug"),
      sortOrder: formData.get("sortOrder") ?? 0,
      isActive: formData.get("isActive") === "on",
    });

  if (parsed.id) {
    await prisma.category.update({ where: { id: parsed.id }, data: parsed });
  } else {
    await prisma.category.create({ data: parsed });
  }

  revalidatePath("/admin/categories");
}

export async function toggleCategoryAction(formData: FormData) {
  await getAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;
  await prisma.category.update({ where: { id }, data: { isActive: !category.isActive } });
  revalidatePath("/admin/categories");
}

export async function upsertCityAction(formData: FormData) {
  await getAdmin();
  const parsed = z
    .object({
      id: z.string().optional(),
      name: z.string().min(2).max(80),
      slug: z.string().min(2).max(80),
      sortOrder: z.coerce.number().int().min(0).default(0),
      isActive: z.boolean().default(true),
    })
    .parse({
      id: optionalText(formData.get("id")) ?? undefined,
      name: formData.get("name"),
      slug: formData.get("slug"),
      sortOrder: formData.get("sortOrder") ?? 0,
      isActive: formData.get("isActive") === "on",
    });

  if (parsed.id) {
    await prisma.city.update({ where: { id: parsed.id }, data: parsed });
  } else {
    await prisma.city.create({ data: parsed });
  }

  revalidatePath("/admin/cities");
}

export async function toggleCityAction(formData: FormData) {
  await getAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) return;
  await prisma.city.update({ where: { id }, data: { isActive: !city.isActive } });
  revalidatePath("/admin/cities");
}

export async function updatePlatformSettingsAction(formData: FormData) {
  await getAdmin();
  await ensurePlatformSettings();
  const parsed = z
    .object({
      defaultCommissionRate: z.coerce.number().min(0).max(1),
      defaultLocale: z.string().min(2).max(5),
      enabledLocales: z.string().min(2),
      defaultCurrency: z.string().min(3).max(3),
      supportWhatsappNumber: z.string().optional(),
      enabledPaymentMethods: z.array(z.string()).min(1),
      partialPaymentEnabled: z.boolean().default(false),
      depositPercentage: z.coerce.number().min(0).max(100).optional(),
      supportedCurrencies: z.string().min(1),
      cancellationPolicyDefault: z.string().min(5).max(1000),
      emailNotificationsEnabled: z.boolean().default(false),
      paymentOptionsEnabled: z.boolean().default(false),
      maintenanceModeEnabled: z.boolean().default(false),
    })
    .parse({
      defaultCommissionRate: formData.get("defaultCommissionRate"),
      defaultLocale: formData.get("defaultLocale"),
      enabledLocales: formData.get("enabledLocales"),
      defaultCurrency: formData.get("defaultCurrency"),
      supportWhatsappNumber: optionalText(formData.get("supportWhatsappNumber")) ?? undefined,
      enabledPaymentMethods: formData.getAll("enabledPaymentMethods").map((value) => String(value)),
      partialPaymentEnabled: formData.get("partialPaymentEnabled") === "on",
      depositPercentage: optionalText(formData.get("depositPercentage")) ?? undefined,
      supportedCurrencies: formData.get("supportedCurrencies"),
      cancellationPolicyDefault: formData.get("cancellationPolicyDefault"),
      emailNotificationsEnabled: formData.get("emailNotificationsEnabled") === "on",
      paymentOptionsEnabled: formData.get("paymentOptionsEnabled") === "on",
      maintenanceModeEnabled: formData.get("maintenanceModeEnabled") === "on",
    });

  await prisma.platformSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...parsed,
      enabledLocales: parsed.enabledLocales.split(",").map((item) => item.trim()).filter(Boolean),
      enabledPaymentMethods: parsed.enabledPaymentMethods as any,
      supportedCurrencies: parsed.supportedCurrencies.split(",").map((item) => item.trim()).filter(Boolean),
    },
    update: {
      ...parsed,
      enabledLocales: parsed.enabledLocales.split(",").map((item) => item.trim()).filter(Boolean),
      enabledPaymentMethods: parsed.enabledPaymentMethods as any,
      supportedCurrencies: parsed.supportedCurrencies.split(",").map((item) => item.trim()).filter(Boolean),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/commissions");
}

export async function updateProviderCommissionAction(formData: FormData) {
  await getAdmin();
  const parsed = z
    .object({
      providerId: z.string().min(1),
      commissionRate: z.coerce.number().min(0).max(1),
      customCommissionEnabled: z.boolean().default(false),
    })
    .parse({
      providerId: formData.get("providerId"),
      commissionRate: formData.get("commissionRate"),
      customCommissionEnabled: formData.get("customCommissionEnabled") === "on",
    });

  await prisma.provider.update({
    where: { id: parsed.providerId },
    data: {
      commissionRate: parsed.commissionRate,
      customCommissionEnabled: parsed.customCommissionEnabled,
    },
  });

  revalidatePath("/admin/commissions");
}
