import { isDownloadLocation } from "@/lib/unsplash";

const API_BASE = process.env.UNSPLASH_API_BASE ?? "https://api.unsplash.com";

/**
 * Unsplash's API guidelines ask that every time a user takes a photo, the
 * photo's download_location is hit so the photographer gets credit.
 */
export async function POST(req: Request) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  let location: unknown;
  try {
    ({ location } = (await req.json()) as { location?: unknown });
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!isDownloadLocation(location)) return Response.json({ error: "bad_request" }, { status: 400 });

  // In tests the base is overridden; keep the path and query, swap the origin.
  const target = new URL(location);
  const base = new URL(API_BASE);
  target.protocol = base.protocol;
  target.host = base.host;

  try {
    const upstream = await fetch(target, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
    if (!upstream.ok) return Response.json({ error: "upstream" }, { status: 502 });
    const json = (await upstream.json()) as { url?: string };
    return Response.json({ url: json.url ?? null });
  } catch {
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
