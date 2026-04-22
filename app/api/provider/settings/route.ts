import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { providerSettingsSchema } from "@/lib/provider/validation";

export async function GET() {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  return NextResponse.json({ provider: authResult.provider });
}

export async function PATCH(request: Request) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const parsed = providerSettingsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings data", details: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.provider.update({
      where: { id: authResult.provider.id },
      data: {
        businessName: parsed.data.businessName,
        city: parsed.data.city,
        description: parsed.data.description,
        phone: parsed.data.phone || null,
        whatsapp: parsed.data.whatsapp || null,
      },
    }),
    prisma.user.update({
      where: { id: authResult.provider.userId },
      data: {
        email: parsed.data.email,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
