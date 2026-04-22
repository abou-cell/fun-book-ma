import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { updateProviderActivity } from "@/lib/provider/service";
import { activityPayloadSchema } from "@/lib/provider/validation";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  const activity = await prisma.activity.findFirst({
    where: { id, providerId: authResult.provider.id },
    include: {
      images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      schedules: { orderBy: [{ date: "asc" }, { startTime: "asc" }], take: 20 },
      _count: { select: { bookings: true } },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  return NextResponse.json({ activity });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const payload = await request.json();
  const parsed = activityPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const activity = await updateProviderActivity(id, authResult.provider.id, parsed.data);

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug is already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to update activity" }, { status: 500 });
  }
}
