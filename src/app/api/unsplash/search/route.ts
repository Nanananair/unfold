import type { NextRequest } from "next/server";
import { isOrientation, mapSearchResponse } from "@/lib/unsplash";

const API_BASE = process.env.UNSPLASH_API_BASE ?? "https://api.unsplash.com";

export async function GET(req: NextRequest) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const params = req.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 200);
  if (!q) return Response.json({ error: "missing_query" }, { status: 400 });
  const page = Math.min(50, Math.max(1, Number(params.get("page")) || 1));
  const orientation = params.get("orientation");

  const url = new URL("/search/photos", API_BASE);
  url.searchParams.set("query", q);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "24");
  url.searchParams.set("content_filter", "high");
  if (isOrientation(orientation)) url.searchParams.set("orientation", orientation);

  let upstream: Response;
  try {
    upstream = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
  } catch {
    return Response.json({ error: "upstream" }, { status: 502 });
  }
  if (upstream.status === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
  if (!upstream.ok) return Response.json({ error: "upstream" }, { status: 502 });

  const data = mapSearchResponse(await upstream.json());
  return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
}
