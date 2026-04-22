import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCheckoutPaymentIntent } from "@/lib/payments/service";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await params;

  try {
    const intent = await createCheckoutPaymentIntent(bookingId, userId);
    return NextResponse.json(intent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create payment intent.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
