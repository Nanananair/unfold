import { describe, expect, it } from "vitest";
import { isDownloadLocation, mapSearchResponse, photoSourceUrl } from "./unsplash";

describe("mapSearchResponse", () => {
  it("trims the upstream shape and adds UTM tags to links", () => {
    const out = mapSearchResponse({
      total: 1,
      total_pages: 1,
      results: [
        {
          id: "abc",
          width: 4000,
          height: 3000,
          color: "#123456",
          alt_description: "a lake",
          urls: { raw: "https://images.unsplash.com/photo-1?ixid=x", small: "s", thumb: "t" },
          links: { html: "https://unsplash.com/photos/abc", download_location: "https://api.unsplash.com/photos/abc/download?ixid=x" },
          user: { name: "Ann", links: { html: "https://unsplash.com/@ann" } },
        },
      ],
    });
    expect(out.results).toHaveLength(1);
    const p = out.results[0];
    expect(p.photoLink).toBe("https://unsplash.com/photos/abc?utm_source=unfold&utm_medium=referral");
    expect(p.user.link).toContain("utm_source=unfold");
    expect(p.alt).toBe("a lake");
  });
  it("copes with empty payloads", () => {
    expect(mapSearchResponse({})).toEqual({ results: [], total: 0, totalPages: 1 });
  });
});

describe("photoSourceUrl", () => {
  it("appends CDN sizing params", () => {
    expect(photoSourceUrl("https://images.unsplash.com/p?ixid=1")).toBe("https://images.unsplash.com/p?ixid=1&w=4096&h=4096&fit=max&fm=jpg&q=85");
  });
});

describe("isDownloadLocation", () => {
  it("only accepts Unsplash download endpoints", () => {
    expect(isDownloadLocation("https://api.unsplash.com/photos/abc_1/download?ixid=2")).toBe(true);
    expect(isDownloadLocation("https://evil.example/photos/abc/download")).toBe(false);
    expect(isDownloadLocation(42)).toBe(false);
  });
});
