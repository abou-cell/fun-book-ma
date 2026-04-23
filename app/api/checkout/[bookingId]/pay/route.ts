import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { processBookingPayment } from "@/lib/payments/service";

const payloadSchema = z
  .object({
    paymentMethod: z.nativeEnum(PaymentMethod),
    intentReference: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.paymentMethod === PaymentMethod.ONLINE_CARD && !value.intentReference) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["intentReference"],
        message: "Missing payment authorization reference.",
      });
    }
  });

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = payloadSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.issues[0]?.message ?? "Invalid payment request." }, { status: 400 });
  }

  const { bookingId } = await params;

  try {
    const result = await processBookingPayment({
      bookingId,
      userId,
      paymentMethod: parsedBody.data.paymentMethod,
      intentReference: parsedBody.data.intentReference,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
