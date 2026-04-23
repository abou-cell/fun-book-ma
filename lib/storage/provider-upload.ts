import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { AppError } from "@/lib/errors/http";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadResult = {
  url: string;
  key: string;
};

export interface FileStorage {
  upload(file: File, folder: string): Promise<UploadResult>;
  remove(key: string): Promise<void>;
}

function assertUploadIsSafe(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new AppError("Unsupported file type. Use JPG, PNG, or WEBP.", 400, "UNSUPPORTED_FILE_TYPE");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new AppError("File is too large. Maximum allowed size is 5MB.", 400, "FILE_TOO_LARGE");
  }
}

function getFileExtension(file: File) {
  const nameExtension = extname(file.name).toLowerCase();

  if (nameExtension) {
    return nameExtension;
  }

  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";

  return ".jpg";
}

export function getProviderActivityUploadFolder(providerId: string, activityId: string, date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `uploads/provider/${providerId}/activities/${activityId}/${year}/${month}`;
}

class LocalFileStorage implements FileStorage {
  async upload(file: File, folder: string) {
    assertUploadIsSafe(file);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = getFileExtension(file);
    const key = `${folder}/${randomUUID()}${extension}`;
    const dir = join(process.cwd(), "public", folder);

    await mkdir(dir, { recursive: true });
    await writeFile(join(process.cwd(), "public", key), buffer);

    return {
      key,
      url: `/${key}`,
    };
  }

  async remove() {
    // local deletion intentionally omitted for now, record delete in DB only
  }
}

export const providerFileStorage: FileStorage = new LocalFileStorage();
