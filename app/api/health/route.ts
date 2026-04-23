export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV,
        services: {
          database: "up",
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        services: {
          database: "down",
        },
      },
      { status: 503 },
    );
  }
}
