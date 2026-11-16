import { describe, expect, it } from "vitest";
import { clampRect, fitCrop, nextRotation, rotatedSize, upscaleFactor } from "./geometry";

describe("rotatedSize", () => {
  it("swaps dimensions for 90 and 270", () => {
    expect(rotatedSize({ w: 400, h: 300 }, 90)).toEqual({ w: 300, h: 400 });
    expect(rotatedSize({ w: 400, h: 300 }, 270)).toEqual({ w: 300, h: 400 });
  });
  it("keeps dimensions for 0 and 180", () => {
    expect(rotatedSize({ w: 400, h: 300 }, 0)).toEqual({ w: 400, h: 300 });
    expect(rotatedSize({ w: 400, h: 300 }, 180)).toEqual({ w: 400, h: 300 });
  });
});

describe("fitCrop", () => {
  it("uses full height when the image is wider than the target aspect", () => {
    // 4000x3000 image, cover aspect 1080/2520 (tall slice)
    const r = fitCrop({ w: 4000, h: 3000 }, 1080 / 2520);
    expect(r.h).toBe(3000);
    expect(r.w).toBe(Math.round(3000 * (1080 / 2520)));
    expect(r.x).toBe(Math.round((4000 - r.w) / 2));
    expect(r.y).toBe(0);
  });
  it("uses full width when the image is taller than the target aspect", () => {
    const r = fitCrop({ w: 1000, h: 4000 }, 1);
    expect(r).toEqual({ x: 0, y: 1500, w: 1000, h: 1000 });
  });
});

describe("clampRect", () => {
  it("pushes a rect back inside bounds", () => {
    expect(clampRect({ x: -10, y: 50, w: 100, h: 100 }, { w: 120, h: 120 })).toEqual({ x: 0, y: 20, w: 100, h: 100 });
  });
  it("shrinks a rect larger than the bounds", () => {
    expect(clampRect({ x: 0, y: 0, w: 500, h: 50 }, { w: 120, h: 120 })).toEqual({ x: 0, y: 0, w: 120, h: 50 });
  });
});

describe("nextRotation", () => {
  it("cycles through right angles", () => {
    expect(nextRotation(0)).toBe(90);
    expect(nextRotation(270)).toBe(0);
  });
});

describe("upscaleFactor", () => {
  it("is >1 when the crop is smaller than the target", () => {
    expect(upscaleFactor({ x: 0, y: 0, w: 540, h: 1260 }, { w: 1080, h: 2520 })).toBe(2);
  });
});
