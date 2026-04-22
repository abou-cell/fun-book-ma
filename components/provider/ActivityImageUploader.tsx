"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ActivityImage = { id: string; imageUrl: string; altText: string | null; sortOrder: number };

type ApiResponse = { error?: string };

export function ActivityImageUploader({ activityId, images }: { activityId: string; images: ActivityImage[] }) {
  const router = useRouter();
  const [altText, setAltText] = useState("");
  const [isCover, setIsCover] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function withStatus(handler: () => Promise<Response>, successMessage: string) {
    setStatus(null);

    const response = await handler();

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiResponse | null;
      setStatus(payload?.error ?? "Operation failed.");
      return;
    }

    setStatus(successMessage);
    startTransition(() => {
      router.refresh();
    });
  }

  async function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("altText", altText);
    formData.set("isCover", String(isCover));

    await withStatus(
      () => fetch(`/api/provider/activities/${activityId}/images`, { method: "POST", body: formData }),
      "Image uploaded.",
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-900">Activity images</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Alt text" value={altText} onChange={(event) => setAltText(event.target.value)} disabled={isPending} />
        <label className="text-sm"><input type="checkbox" checked={isCover} onChange={(event) => setIsCover(event.target.checked)} disabled={isPending} /> Set as cover</label>
        <input type="file" accept="image/*" className="text-sm" disabled={isPending} onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void upload(file);
          }
        }} />
      </div>
      {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <div key={image.id} className="rounded-lg border border-slate-200 p-2">
            <Image src={image.imageUrl} alt={image.altText ?? "Activity image"} width={640} height={256} className="h-32 w-full rounded object-cover" />
            <div className="mt-2 flex gap-2">
              <button className="rounded border px-2 py-1 text-xs" disabled={isPending} onClick={async () => {
                await withStatus(
                  () => fetch(`/api/provider/activities/${activityId}/images`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ coverImageId: image.id }),
                  }),
                  "Cover image updated.",
                );
              }}>Set cover</button>
              <button className="rounded border px-2 py-1 text-xs" disabled={isPending} onClick={async () => {
                await withStatus(
                  () => fetch(`/api/provider/activities/${activityId}/images`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageId: image.id }),
                  }),
                  "Image deleted.",
                );
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
