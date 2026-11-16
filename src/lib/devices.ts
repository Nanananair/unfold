export type Size = { w: number; h: number };

export type Device = {
  id: string;
  brand: string;
  name: string;
  /** Cover (outer) screen, portrait: w < h. */
  cover: Size;
  /** Inner (unfolded) screen, held upright with the hinge vertical. */
  inner: Size;
  year: number;
};

export const CUSTOM_DEVICE_ID = "custom";

/**
 * Native panel resolutions. Width/height are in the orientation the phone is
 * normally held: cover portrait, inner upright with a vertical hinge.
 * Figures come from manufacturer spec sheets and GSMArena; the custom option
 * covers anything missing or wrong.
 */
export const DEVICES: Device[] = [
  { id: "samsung-fold8-ultra", brand: "Samsung", name: "Galaxy Z Fold 8 Ultra", cover: { w: 1080, h: 2520 }, inner: { w: 2256, h: 2504 }, year: 2026 },
  { id: "samsung-fold7", brand: "Samsung", name: "Galaxy Z Fold 7", cover: { w: 1080, h: 2520 }, inner: { w: 1968, h: 2184 }, year: 2025 },
  { id: "samsung-fold6", brand: "Samsung", name: "Galaxy Z Fold 6", cover: { w: 968, h: 2376 }, inner: { w: 1856, h: 2160 }, year: 2024 },
  { id: "samsung-fold5", brand: "Samsung", name: "Galaxy Z Fold 5", cover: { w: 904, h: 2316 }, inner: { w: 1812, h: 2176 }, year: 2023 },
  { id: "samsung-fold4", brand: "Samsung", name: "Galaxy Z Fold 4", cover: { w: 904, h: 2316 }, inner: { w: 1812, h: 2176 }, year: 2022 },
  { id: "samsung-fold3", brand: "Samsung", name: "Galaxy Z Fold 3", cover: { w: 832, h: 2268 }, inner: { w: 1768, h: 2208 }, year: 2021 },
  { id: "google-pixel10-pro-fold", brand: "Google", name: "Pixel 10 Pro Fold", cover: { w: 1080, h: 2364 }, inner: { w: 2076, h: 2152 }, year: 2025 },
  { id: "google-pixel9-pro-fold", brand: "Google", name: "Pixel 9 Pro Fold", cover: { w: 1080, h: 2424 }, inner: { w: 2076, h: 2152 }, year: 2024 },
  { id: "google-pixel-fold", brand: "Google", name: "Pixel Fold", cover: { w: 1080, h: 2092 }, inner: { w: 1840, h: 2208 }, year: 2023 },
  { id: "oneplus-open", brand: "OnePlus", name: "OnePlus Open / Oppo Find N3", cover: { w: 1116, h: 2484 }, inner: { w: 2268, h: 2440 }, year: 2023 },
  { id: "oppo-find-n5", brand: "Oppo", name: "Find N5", cover: { w: 1140, h: 2616 }, inner: { w: 2248, h: 2480 }, year: 2025 },
  { id: "honor-magic-v5", brand: "Honor", name: "Magic V5", cover: { w: 1060, h: 2376 }, inner: { w: 2172, h: 2352 }, year: 2025 },
  { id: "honor-magic-v3", brand: "Honor", name: "Magic V3", cover: { w: 1060, h: 2376 }, inner: { w: 2156, h: 2344 }, year: 2024 },
  { id: "vivo-x-fold5", brand: "Vivo", name: "X Fold 5", cover: { w: 1172, h: 2748 }, inner: { w: 2200, h: 2480 }, year: 2025 },
  { id: "huawei-mate-x6", brand: "Huawei", name: "Mate X6", cover: { w: 1080, h: 2440 }, inner: { w: 2240, h: 2440 }, year: 2024 },
  { id: "xiaomi-mix-fold4", brand: "Xiaomi", name: "Mix Fold 4", cover: { w: 1080, h: 2520 }, inner: { w: 2224, h: 2488 }, year: 2024 },
];

export const DEFAULT_DEVICE_ID = "samsung-fold8-ultra";

export function findDevice(id: string): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}

export function makeCustomDevice(cover: Size, inner: Size): Device {
  return { id: CUSTOM_DEVICE_ID, brand: "Custom", name: "Custom sizes", cover, inner, year: 0 };
}

export function aspect(s: Size): number {
  return s.w / s.h;
}

export function formatSize(s: Size): string {
  return `${s.w} × ${s.h}`;
}
