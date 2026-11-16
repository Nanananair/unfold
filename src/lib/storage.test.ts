import { describe, expect, it } from "vitest";
import { parseDevice } from "./storage";

describe("parseDevice", () => {
  it("falls back to the default device on garbage", () => {
    expect(parseDevice(null).id).toBe("samsung-fold8-ultra");
    expect(parseDevice("{not json").id).toBe("samsung-fold8-ultra");
    expect(parseDevice(JSON.stringify({ id: "nope" })).id).toBe("samsung-fold8-ultra");
  });
  it("restores a preset and a custom device", () => {
    expect(parseDevice(JSON.stringify({ id: "google-pixel9-pro-fold" })).name).toBe("Pixel 9 Pro Fold");
    const c = parseDevice(JSON.stringify({ id: "custom", cover: { w: 1, h: 2 }, inner: { w: 3, h: 4 } }));
    expect(c.id).toBe("custom");
    expect(c.inner).toEqual({ w: 3, h: 4 });
  });
});
