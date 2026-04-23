import { z } from "zod";

const nameSchema = z.string().trim().min(2, "Customer name is required.").max(120, "Customer name is too long.");
const emailSchema = z.email("Please provide a valid email address.").transform((email) => email.trim().toLowerCase());
const optionalTrimmedString = z
  .string()
  .trim()
  .max(500, "Field is too long.")
  .optional()
  .transform((value) => value || null);

export const bookingRequestSchema = z.object({
  activityId: z.string().trim().min(1, "Missing activity selection."),
  scheduleId: z.string().trim().min(1, "Missing schedule selection."),
  participants: z
    .coerce.number()
    .int("Invalid participant count.")
    .min(1, "At least 1 participant is required.")
    .max(20, "Maximum 20 participants are allowed per booking."),
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: optionalTrimmedString,
  notes: optionalTrimmedString,
});

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequestPayload = z.output<typeof bookingRequestSchema>;
