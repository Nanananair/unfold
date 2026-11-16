import { useMemo, useSyncExternalStore } from "react";
import { CUSTOM_DEVICE_ID, DEFAULT_DEVICE_ID, findDevice, makeCustomDevice, type Device } from "./devices";

const KEY = "unfold.device.v1";

type Stored = { id: string; cover?: { w: number; h: number }; inner?: { w: number; h: number } };

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function parseDevice(raw: string | null): Device {
  const fallback = findDevice(DEFAULT_DEVICE_ID)!;
  if (!raw) return fallback;
  try {
    const s = JSON.parse(raw) as Stored;
    if (s.id === CUSTOM_DEVICE_ID && s.cover && s.inner) return makeCustomDevice(s.cover, s.inner);
    return findDevice(s.id) ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveDevice(d: Device) {
  try {
    const s: Stored = d.id === CUSTOM_DEVICE_ID ? { id: d.id, cover: d.cover, inner: d.inner } : { id: d.id };
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode etc. */
  }
  listeners.forEach((l) => l());
}

/** The chosen device, persisted in localStorage. Server-rendered as the default device. */
export function useStoredDevice(): [Device, (d: Device) => void] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const device = useMemo(() => parseDevice(raw), [raw]);
  return [device, saveDevice];
}
