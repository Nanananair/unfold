"use client";

import type { Device } from "@/lib/devices";
import { aspect, formatSize } from "@/lib/devices";
import { nextRotation, upscaleFactor } from "@/lib/geometry";
import { recipeInfo, targetSize, type Framing, type Recipe, type TargetKey } from "@/lib/types";
import { CropEditor } from "./CropEditor";
import { Button, Heading } from "./ui";

export type Source = { url: string; size: { w: number; h: number } };

export function FrameStep({
  recipe,
  device,
  active,
  onActive,
  sources,
  framing,
  onFraming,
  mirror,
  onMirror,
}: {
  recipe: Recipe;
  device: Device;
  active: TargetKey;
  onActive: (k: TargetKey) => void;
  sources: Record<TargetKey, Source | null>;
  framing: Record<TargetKey, Framing>;
  onFraming: (k: TargetKey, patch: Partial<Framing>) => void;
  mirror: boolean;
  onMirror: (v: boolean) => void;
}) {
  const info = recipeInfo(recipe);
  const src = sources[active];
  const target = targetSize(device, active);
  const f = framing[active];
  const oneImage = info.photos === 1;

  const titles: Record<TargetKey, { t: string; s: string }> = oneImage
    ? {
        inner: { t: "Frame the full scene", s: "This is what you see when the phone is open. Drag and pinch." },
        cover: { t: "Pick the cover slice", s: "A tall crop taken from the inner wallpaper, so closing the phone zooms in." },
      }
    : {
        cover: { t: "Frame the cover photo", s: "Shown when the phone is closed. Drag and pinch." },
        inner: { t: "Frame the inner photo", s: "Shown when the phone is open. Line things up with the hinge." },
      };

  const factor = f.pixels ? upscaleFactor(f.pixels, target) : 1;

  return (
    <div>
      <Heading title={titles[active].t} sub={titles[active].s} />

      <div className="mb-3 flex gap-2">
        {info.order.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onActive(k)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${active === k ? "border-accent bg-accent/10 text-ink" : "border-line bg-panel text-muted"}`}
          >
            {k === "cover" ? "Cover" : "Inner"} <span className="font-mono text-xs opacity-70">{formatSize(targetSize(device, k))}</span>
          </button>
        ))}
      </div>

      {src ? (
        <CropEditor image={src.url} aspect={aspect(target)} framing={f} onChange={(p) => onFraming(active, p)} showHinge={active === "inner"} />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
          Frame the inner screen first.
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button className="px-3 py-2" onClick={() => onFraming(active, { rotation: nextRotation(f.rotation), position: { x: 0, y: 0 }, zoom: 1 })}>
          ⟳ Rotate ({f.rotation}°)
        </Button>
        <Button variant="ghost" className="px-3 py-2" onClick={() => onFraming(active, { position: { x: 0, y: 0 }, zoom: 1 })}>
          Reset
        </Button>
        {recipe === "mirror" && active === "inner" && (
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={mirror} onChange={(e) => onMirror(e.target.checked)} className="accent-accent" />
            Perfect mirror
          </label>
        )}
      </div>

      {factor > 1.6 && (
        <p className="mt-2 text-xs text-danger">
          This crop is upscaled {factor.toFixed(1)}×, so it will look soft. Zoom out or use a larger photo.
        </p>
      )}
      {recipe === "mirror" && active === "inner" && (
        <p className="mt-2 text-xs text-muted">
          Line the waterline (or any axis of symmetry) up with the hinge guide. “Perfect mirror” copies the left half onto the right for exact
          symmetry.
        </p>
      )}
    </div>
  );
}
