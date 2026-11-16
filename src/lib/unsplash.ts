/** Pure helpers for the Unsplash integration; the network calls live in the API routes. */

export type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string;
  alt: string;
  thumb: string;
  small: string;
  raw: string;
  photoLink: string;
  downloadLocation: string;
  user: { name: string; link: string };
};

export type UnsplashSearch = {
  results: UnsplashPhoto[];
  total: number;
  totalPages: number;
};

export const UTM = "utm_source=unfold&utm_medium=referral";

function withUtm(link: string): string {
  return link.includes("?") ? `${link}&${UTM}` : `${link}?${UTM}`;
}

type RawResult = {
  id: string;
  width: number;
  height: number;
  color?: string | null;
  alt_description?: string | null;
  description?: string | null;
  urls: { raw: string; small: string; thumb: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
};

export function mapSearchResponse(json: { results?: RawResult[]; total?: number; total_pages?: number }): UnsplashSearch {
  const results = (json.results ?? []).map<UnsplashPhoto>((r) => ({
    id: r.id,
    width: r.width,
    height: r.height,
    color: r.color ?? "#222",
    alt: r.alt_description ?? r.description ?? "",
    thumb: r.urls.thumb,
    small: r.urls.small,
    raw: r.urls.raw,
    photoLink: withUtm(r.links.html),
    downloadLocation: r.links.download_location,
    user: { name: r.user.name, link: withUtm(r.user.links.html) },
  }));
  return { results, total: json.total ?? results.length, totalPages: json.total_pages ?? 1 };
}

/** A large JPEG rendition via Unsplash's image CDN: long edge capped, never upscaled. */
export function photoSourceUrl(raw: string, maxEdge = 4096): string {
  const sep = raw.includes("?") ? "&" : "?";
  return `${raw}${sep}w=${maxEdge}&h=${maxEdge}&fit=max&fm=jpg&q=85`;
}

export const ORIENTATIONS = ["landscape", "portrait", "squarish"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export function isOrientation(v: string | null): v is Orientation {
  return !!v && (ORIENTATIONS as readonly string[]).includes(v);
}

/** The download_location Unsplash hands out, and nothing else, may be forwarded by the download route. */
export function isDownloadLocation(v: unknown): v is string {
  return typeof v === "string" && /^https:\/\/api\.unsplash\.com\/photos\/[A-Za-z0-9_-]+\/download(\?.*)?$/.test(v);
}
