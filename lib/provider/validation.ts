import { ActivityCategory } from "@prisma/client";
import { z } from "zod";

const commaSeparatedList = z
  .string()
  .optional()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

export const activityPayloadSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().min(20).max(240),
  description: z.string().min(50).max(5000),
  city: z.string().min(2).max(80),
  category: z.nativeEnum(ActivityCategory),
  price: z.coerce.number().positive().max(100000),
  duration: z.string().min(2).max(80),
  meetingPoint: z.string().min(3).max(200),
  languages: commaSeparatedList,
  includedItems: commaSeparatedList,
  excludedItems: commaSeparatedList,
  cancellationPolicy: z.string().min(10).max(1000),
  capacity: z.coerce.number().int().positive().max(500).optional(),
  isActive: z.coerce.boolean().default(true),
});

export const schedulePayloadSchema = z
  .object({
    activityId: z.string().cuid(),
    date: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    capacity: z.coerce.number().int().positive().max(200),
    availableSpots: z.coerce.number().int().nonnegative().max(200).optional(),
    price: z.coerce.number().positive().max(100000),
    isActive: z.coerce.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    if (value.availableSpots !== undefined && value.availableSpots > value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableSpots"],
        message: "Available spots cannot be greater than capacity",
      });
    }
  });

export const providerSettingsSchema = z.object({
  businessName: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  description: z.string().min(20).max(1000),
  phone: z.string().max(40).optional().default(""),
  whatsapp: z.string().max(40).optional().default(""),
  email: z.string().email(),
});

export function createSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}


export const activityImageUploadSchema = z.object({
  altText: z.string().trim().max(180).optional().default(""),
  isCover: z
    .union([z.boolean(), z.string()])
    .transform((value) => (typeof value === "boolean" ? value : value === "true"))
    .default(false),
});

export const activityImagePatchSchema = z.object({
  order: z.array(z.string().cuid()).optional(),
  coverImageId: z.string().cuid().optional(),
}).refine((value) => Boolean(value.order?.length || value.coverImageId), {
  message: "Either order or coverImageId is required",
});

export const activityImageDeleteSchema = z.object({
  imageId: z.string().cuid(),
});
