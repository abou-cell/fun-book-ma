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

class LocalFileStorage implements FileStorage {
  async upload(file: File, folder: string) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = extname(file.name) || ".jpg";
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
