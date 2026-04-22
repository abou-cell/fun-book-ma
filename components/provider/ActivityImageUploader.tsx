"use client";

import { useState } from "react";

type ActivityImage = { id: string; imageUrl: string; altText: string | null; sortOrder: number };

export function ActivityImageUploader({ activityId, images }: { activityId: string; images: ActivityImage[] }) {
  const [altText, setAltText] = useState("");
  const [isCover, setIsCover] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("altText", altText);
    formData.set("isCover", String(isCover));

    const response = await fetch(`/api/provider/activities/${activityId}/images`, { method: "POST", body: formData });
    if (!response.ok) {
      setStatus("Upload failed.");
      return;
    }

    setStatus("Image uploaded.");
    window.location.reload();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-900">Activity images</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Alt text" value={altText} onChange={(e) => setAltText(e.target.value)} />
        <label className="text-sm"><input type="checkbox" checked={isCover} onChange={(e) => setIsCover(e.target.checked)} /> Set as cover</label>
        <input type="file" accept="image/*" className="text-sm" onChange={(event) => {
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
            <img src={image.imageUrl} alt={image.altText ?? "Activity image"} className="h-32 w-full rounded object-cover" />
            <div className="mt-2 flex gap-2">
              <button className="rounded border px-2 py-1 text-xs" onClick={async () => {
                await fetch(`/api/provider/activities/${activityId}/images`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ coverImageId: image.id }),
                });
                window.location.reload();
              }}>Set cover</button>
              <button className="rounded border px-2 py-1 text-xs" onClick={async () => {
                await fetch(`/api/provider/activities/${activityId}/images`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ imageId: image.id }),
                });
                window.location.reload();
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
