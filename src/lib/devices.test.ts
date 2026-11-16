import { describe, expect, it } from "vitest";
import { DEFAULT_DEVICE_ID, DEVICES, findDevice } from "./devices";

describe("device table", () => {
  it("has unique ids and portrait cover screens", () => {
    const ids = new Set(DEVICES.map((d) => d.id));
    expect(ids.size).toBe(DEVICES.length);
    for (const d of DEVICES) {
      expect(d.cover.w, d.name).toBeLessThan(d.cover.h);
      expect(d.inner.w, d.name).toBeGreaterThan(0);
      expect(d.inner.h, d.name).toBeGreaterThan(0);
    }
  });
  it("defaults to the Fold 8 Ultra at its native sizes", () => {
    const d = findDevice(DEFAULT_DEVICE_ID)!;
    expect(d.cover).toEqual({ w: 1080, h: 2520 });
    expect(d.inner).toEqual({ w: 2256, h: 2504 });
  });
});
