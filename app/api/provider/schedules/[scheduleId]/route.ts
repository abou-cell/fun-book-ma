import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { upsertProviderSchedule } from "@/lib/provider/service";
import { schedulePayloadSchema } from "@/lib/provider/validation";

type RouteProps = {
  params: Promise<{ scheduleId: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { scheduleId } = await params;
  const raw = await request.json();

  if (typeof raw.isActive === "boolean" && Object.keys(raw).length === 1) {
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, activity: { providerId: authResult.provider.id } },
      select: { id: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    await prisma.schedule.update({ where: { id: scheduleId }, data: { isActive: raw.isActive } });
    return NextResponse.json({ ok: true });
  }

  const parsed = schedulePayloadSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid schedule payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await upsertProviderSchedule(authResult.provider.id, { ...parsed.data, scheduleId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update schedule" }, { status: 400 });
  }
}
