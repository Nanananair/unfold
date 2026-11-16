import type { Size } from "./devices";

export type Rect = { x: number; y: number; w: number; h: number };
export type Rotation = 0 | 90 | 180 | 270;

/** Bounding box of an image after rotating it by a right angle. */
export function rotatedSize(size: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270 ? { w: size.h, h: size.w } : { ...size };
}

/** The largest rect of the given aspect (w/h) that fits inside `size`, centred. */
export function fitCrop(size: Size, aspectRatio: number): Rect {
  const containerAspect = size.w / size.h;
  let w: number;
  let h: number;
  if (containerAspect > aspectRatio) {
    h = size.h;
    w = Math.round(h * aspectRatio);
  } else {
    w = size.w;
    h = Math.round(w / aspectRatio);
  }
  return { x: Math.round((size.w - w) / 2), y: Math.round((size.h - h) / 2), w, h };
}

/** Clamp a rect so it lies within a `bounds` size (origin 0,0), preserving its size when possible. */
export function clampRect(rect: Rect, bounds: Size): Rect {
  const w = Math.min(rect.w, bounds.w);
  const h = Math.min(rect.h, bounds.h);
  const x = Math.min(Math.max(0, rect.x), bounds.w - w);
  const y = Math.min(Math.max(0, rect.y), bounds.h - h);
  return { x, y, w, h };
}

export function nextRotation(r: Rotation): Rotation {
  return (((r + 90) % 360) as Rotation);
}

/** How much the source will be scaled when a crop is stretched to a target. >1 means upscaling (soft). */
export function upscaleFactor(crop: Rect, target: Size): number {
  return target.w / crop.w;
}
