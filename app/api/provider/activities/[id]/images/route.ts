import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireProviderSession } from "@/lib/provider/auth";
import { ensureProviderOwnsActivity } from "@/lib/provider/service";
import {
  activityImageDeleteSchema,
  activityImagePatchSchema,
  activityImageUploadSchema,
} from "@/lib/provider/validation";
import {
  getProviderActivityUploadFolder,
  providerFileStorage,
} from "@/lib/storage/provider-upload";

type RouteProps = { params: Promise<{ id: string }> };

async function verifyProviderActivity(activityId: string, providerId: string) {
  try {
    return await ensureProviderOwnsActivity(activityId, providerId);
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const activity = await verifyProviderActivity(id, authResult.provider.id);

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const parsedMeta = activityImageUploadSchema.safeParse({
    altText: formData.get("altText"),
    isCover: formData.get("isCover"),
  });

  if (!parsedMeta.success) {
    return NextResponse.json({ error: "Invalid image metadata", details: parsedMeta.error.flatten() }, { status: 400 });
  }

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
    const uploadFolder = getProviderActivityUploadFolder(authResult.provider.id, id);
    const upload = await providerFileStorage.upload(file, uploadFolder);

    const image = await prisma.$transaction(async (tx) => {
      const currentCount = await tx.activityImage.count({ where: { activityId: id } });

      if (parsedMeta.data.isCover) {
        await tx.activityImage.updateMany({ where: { activityId: id, sortOrder: -1 }, data: { sortOrder: 1 } });
      }

      const createdImage = await tx.activityImage.create({
        data: {
          activityId: id,
          imageUrl: upload.url,
          altText: parsedMeta.data.altText || null,
          sortOrder: parsedMeta.data.isCover ? -1 : currentCount + 1,
        },
      });

      if (parsedMeta.data.isCover || !activity.coverImage) {
        await tx.activity.update({ where: { id }, data: { coverImage: upload.url } });
      }

      return createdImage;
    });

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
  const activity = await verifyProviderActivity(id, authResult.provider.id);

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = activityImagePatchSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.order) {
    await Promise.all(
      parsed.data.order.map((imageId, index) =>
        prisma.activityImage.updateMany({ where: { id: imageId, activityId: id }, data: { sortOrder: index + 1 } }),
      ),
    );
  }

  if (parsed.data.coverImageId) {
    const cover = await prisma.activityImage.findFirst({ where: { id: parsed.data.coverImageId, activityId: id } });

    if (!cover) {
      return NextResponse.json({ error: "Cover image not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.activity.update({ where: { id }, data: { coverImage: cover.imageUrl } }),
      prisma.activityImage.updateMany({ where: { activityId: id }, data: { sortOrder: 1 } }),
      prisma.activityImage.update({ where: { id: cover.id }, data: { sortOrder: -1 } }),
    ]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const authResult = await requireProviderSession();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const activity = await verifyProviderActivity(id, authResult.provider.id);

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = activityImageDeleteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "imageId is required" }, { status: 400 });
  }

  const image = await prisma.activityImage.findFirst({
    where: { id: parsed.data.imageId, activityId: id },
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await providerFileStorage.remove(image.imageUrl);

  await prisma.$transaction(async (tx) => {
    await tx.activityImage.delete({ where: { id: image.id } });

    if (activity.coverImage === image.imageUrl) {
      const nextCover = await tx.activityImage.findFirst({
        where: { activityId: id },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      await tx.activity.update({ where: { id }, data: { coverImage: nextCover?.imageUrl ?? "/images/activity-placeholder.jpg" } });

      if (nextCover) {
        await tx.activityImage.update({ where: { id: nextCover.id }, data: { sortOrder: -1 } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
