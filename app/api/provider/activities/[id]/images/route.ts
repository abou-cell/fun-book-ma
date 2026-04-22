import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { providerFileStorage } from "@/lib/storage/provider-upload";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  const activity = await prisma.activity.findFirst({
    where: { id, providerId: authResult.provider.id },
    select: { id: true },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim();
  const isCover = String(formData.get("isCover") ?? "false") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be 5MB or less" }, { status: 400 });
  }

  try {
    const upload = await providerFileStorage.upload(file, `uploads/provider/${authResult.provider.id}/activities/${id}`);
    const currentCount = await prisma.activityImage.count({ where: { activityId: id } });

    if (isCover) {
      await prisma.activityImage.updateMany({ where: { activityId: id, sortOrder: -1 }, data: { sortOrder: 0 } });
    }

    const image = await prisma.activityImage.create({
      data: {
        activityId: id,
        imageUrl: upload.url,
        altText: altText || null,
        sortOrder: isCover ? -1 : currentCount + 1,
      },
    });

    if (isCover) {
      await prisma.activity.update({ where: { id }, data: { coverImage: upload.url } });
    }

    return NextResponse.json({ image }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const body = (await request.json()) as { order?: string[]; coverImageId?: string };

  const activity = await prisma.activity.findFirst({
    where: { id, providerId: authResult.provider.id },
    select: { id: true },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  if (Array.isArray(body.order)) {
    await Promise.all(
      body.order.map((imageId, index) =>
        prisma.activityImage.updateMany({ where: { id: imageId, activityId: id }, data: { sortOrder: index + 1 } }),
      ),
    );
  }

  if (body.coverImageId) {
    const cover = await prisma.activityImage.findFirst({ where: { id: body.coverImageId, activityId: id } });

    if (!cover) {
      return NextResponse.json({ error: "Cover image not found" }, { status: 404 });
    }

    await prisma.activity.update({ where: { id }, data: { coverImage: cover.imageUrl } });
    await prisma.activityImage.updateMany({ where: { activityId: id }, data: { sortOrder: 1 } });
    await prisma.activityImage.update({ where: { id: cover.id }, data: { sortOrder: -1 } });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const body = (await request.json()) as { imageId?: string };

  if (!body.imageId) {
    return NextResponse.json({ error: "imageId is required" }, { status: 400 });
  }

  const image = await prisma.activityImage.findFirst({
    where: { id: body.imageId, activityId: id, activity: { providerId: authResult.provider.id } },
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await providerFileStorage.remove(image.imageUrl);
  await prisma.activityImage.delete({ where: { id: image.id } });

  return NextResponse.json({ ok: true });
}
