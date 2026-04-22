import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { upsertProviderSchedule } from "@/lib/provider/service";
import { schedulePayloadSchema } from "@/lib/provider/validation";

export async function GET() {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const schedules = await prisma.schedule.findMany({
    where: { activity: { providerId: authResult.provider.id } },
    include: { activity: { select: { id: true, title: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ schedules });
}

export async function POST(request: Request) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const parsed = schedulePayloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid schedule payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const schedule = await upsertProviderSchedule(authResult.provider.id, parsed.data);
    return NextResponse.json({ scheduleId: schedule.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create schedule" }, { status: 400 });
  }
}
