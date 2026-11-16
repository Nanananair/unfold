import type { Size } from "./devices";
import { clampRect, rotatedSize, type Rect, type Rotation } from "./geometry";

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

export type RenderOptions = {
  /** Mirror the left half onto the right half, for a perfect reflection down the hinge. */
  mirror?: boolean;
};

/**
 * Draw `crop` (a rect in the coordinates of the rotated image, as react-easy-crop
 * reports it) onto a canvas of exactly `target` pixels, and return a PNG blob.
 * Draws straight from the source image with a transform, so no full-size
 * intermediate canvas is needed even for very large panoramas.
 */
export async function renderFraming(
  img: HTMLImageElement,
  crop: Rect,
  rotation: Rotation,
  target: Size,
  opts: RenderOptions = {},
): Promise<Blob> {
  const natural = { w: img.naturalWidth, h: img.naturalHeight };
  const rot = rotatedSize(natural, rotation);
  const c = clampRect(crop, rot);

  const out = document.createElement("canvas");
  out.width = target.w;
  out.height = target.h;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  ctx.translate(target.w / 2, target.h / 2);
  ctx.scale(target.w / c.w, target.h / c.h);
  ctx.translate(-(c.x + c.w / 2 - rot.w / 2), -(c.y + c.h / 2 - rot.h / 2));
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -natural.w / 2, -natural.h / 2);
  ctx.restore();

  if (opts.mirror) {
    const half = Math.floor(target.w / 2);
    ctx.save();
    ctx.translate(target.w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(out, 0, 0, half, target.h, 0, 0, half, target.h);
    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    out.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode PNG"))), "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canShareFiles(files: File[]): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}
