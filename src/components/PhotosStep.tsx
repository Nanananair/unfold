"use client";

import { useRef, useState } from "react";
import type { Device } from "@/lib/devices";
import { loadImage } from "@/lib/render";
import { recipeInfo, type Photo, type Recipe } from "@/lib/types";
import { Button, Card, Heading } from "./ui";
import { UnsplashSheet } from "./UnsplashSheet";

export function PhotosStep({
  recipe,
  device,
  photos,
  onChange,
}: {
  recipe: Recipe;
  device: Device;
  photos: (Photo | null)[];
  onChange: (index: number, photo: Photo | null) => void;
}) {
  const info = recipeInfo(recipe);
  const [searching, setSearching] = useState<number | null>(null);
  return (
    <div>
      <Heading
        title={info.photos === 1 ? "Add your photo" : "Add both photos"}
        sub="Your own photos stay on your phone. Or search Unsplash's free library without leaving the page."
      />
      <div className="space-y-3">
        {info.photoLabels.map((label, i) => (
          <PhotoSlot key={i} label={label} photo={photos[i] ?? null} device={device} onChange={(p) => onChange(i, p)} onSearch={() => setSearching(i)} />
        ))}
      </div>
      {searching !== null && (
        <UnsplashSheet
          initialQuery={info.searchTerms[Math.min(searching, info.searchTerms.length - 1)] ?? info.searchTerms[0]}
          suggestions={info.searchTerms}
          orientation={recipe === "pair" ? undefined : "landscape"}
          onPick={(p) => {
            onChange(searching, p);
            setSearching(null);
          }}
          onClose={() => setSearching(null)}
        />
      )}
    </div>
  );
}

function PhotoSlot({
  label,
  photo,
  device,
  onChange,
  onSearch,
}: {
  label: string;
  photo: Photo | null;
  device: Device;
  onChange: (p: Photo | null) => void;
  onSearch: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      onChange({ url, name: file.name, size: { w: img.naturalWidth, h: img.naturalHeight } });
    } catch {
      URL.revokeObjectURL(url);
      alert("That file could not be read as an image.");
    }
  }

  const biggest = Math.max(device.inner.w, device.inner.h);
  const small = photo && Math.max(photo.size.w, photo.size.h) < biggest;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-panel-2">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-muted">+</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">{label}</div>
          {photo ? (
            <div className="mt-0.5 truncate font-mono text-xs text-muted">
              {photo.size.w} × {photo.size.h} · {photo.name}
            </div>
          ) : (
            <div className="mt-0.5 text-xs text-muted">JPG, PNG, HEIC (if your browser can open it)</div>
          )}
          {photo?.credit && (
            <div className="mt-0.5 text-xs text-muted">
              Photo by{" "}
              <a className="underline" href={photo.credit.userLink} target="_blank" rel="noreferrer">
                {photo.credit.name}
              </a>{" "}
              on{" "}
              <a className="underline" href={photo.credit.photoLink} target="_blank" rel="noreferrer">
                Unsplash
              </a>
            </div>
          )}
          {small && (
            <div className="mt-1 text-xs text-danger">
              Smaller than the inner screen, so it will be upscaled and look soft. A larger photo would be sharper.
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant={photo ? "secondary" : "primary"} className="px-3 py-2" onClick={() => inputRef.current?.click()}>
              {photo ? "Replace" : "Choose photo"}
            </Button>
            <Button variant="secondary" className="px-3 py-2" onClick={onSearch}>
              Search Unsplash
            </Button>
            {photo && (
              <Button variant="ghost" className="px-3 py-2" onClick={() => onChange(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </Card>
  );
}
