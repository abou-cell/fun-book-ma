import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

export type UploadResult = {
  url: string;
  key: string;
};

export interface FileStorage {
  upload(file: File, folder: string): Promise<UploadResult>;
  remove(key: string): Promise<void>;
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
