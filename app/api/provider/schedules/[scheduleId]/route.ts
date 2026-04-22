import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = {
  params: Promise<{ scheduleId: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });

  if (!provider) {
    return NextResponse.json({ error: "Provider account required" }, { status: 403 });
  }

  const { scheduleId } = await params;
  const body = (await request.json()) as { isActive?: boolean };

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const schedule = await prisma.schedule.findFirst({
    where: {
      id: scheduleId,
      activity: {
        providerId: provider.id,
      },
    },
    select: { id: true },
  });

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  await prisma.schedule.update({
    where: { id: scheduleId },
    data: { isActive: body.isActive },
  });

  return NextResponse.json({ ok: true });
}
