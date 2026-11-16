"use client";

import { useEffect, useRef, useState } from "react";
import { loadImage } from "@/lib/render";
import type { Photo } from "@/lib/types";
import { photoSourceUrl, type Orientation, type UnsplashPhoto, type UnsplashSearch } from "@/lib/unsplash";
import { Button } from "./ui";

type Status = "idle" | "loading" | "ok" | "not_configured" | "rate_limited" | "error";

export function UnsplashSheet({
  initialQuery,
  suggestions,
  orientation,
  onPick,
  onClose,
}: {
  initialQuery: string;
  suggestions: string[];
  orientation?: Orientation;
  onPick: (photo: Photo) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<Status>(initialQuery ? "loading" : "idle");
  const [picking, setPicking] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!submitted) return;
    let cancelled = false;
    const url = `/api/unsplash/search?q=${encodeURIComponent(submitted)}&page=${page}${orientation ? `&orientation=${orientation}` : ""}`;
    fetch(url)
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 503) return setStatus("not_configured");
        if (r.status === 429) return setStatus("rate_limited");
        if (!r.ok) return setStatus("error");
        const data = (await r.json()) as UnsplashSearch;
        if (cancelled) return;
        setResults((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
        setTotalPages(data.totalPages);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [submitted, page, orientation]);

  function search(q: string) {
    const t = q.trim();
    if (!t) return;
    setQuery(t);
    setStatus("loading");
    setPage(1);
    setSubmitted(t);
  }

  async function pick(p: UnsplashPhoto) {
    setPicking(p.id);
    // Required by Unsplash's guidelines: register the download so the photographer gets credit.
    fetch("/api/unsplash/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: p.downloadLocation }),
    }).catch(() => {});
    try {
      const url = photoSourceUrl(p.raw);
      const img = await loadImage(url, { crossOrigin: true });
      onPick({
        url,
        name: `Unsplash · ${p.user.name}`,
        size: { w: img.naturalWidth, h: img.naturalHeight },
        credit: { name: p.user.name, userLink: p.user.link, photoLink: p.photoLink },
      });
    } catch {
      setPicking(null);
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search Unsplash">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search free photos…"
            autoFocus
            enterKeyHint="search"
            className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-base outline-none focus:border-accent"
            aria-label="Search query"
          />
          <Button type="submit" variant="primary" className="px-4">
            Search
          </Button>
          <Button type="button" variant="ghost" className="px-3" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </form>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => search(s)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${submitted === s ? "border-accent text-ink" : "border-line text-muted hover:text-ink"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex-1 overflow-y-auto pb-6">
          {status === "not_configured" && (
            <Notice title="Unsplash search isn't set up on this site">
              The site owner needs to add an <code className="font-mono">UNSPLASH_ACCESS_KEY</code>. Until then, open{" "}
              <a className="underline" href={`https://unsplash.com/s/photos/${encodeURIComponent(submitted)}?utm_source=unfold&utm_medium=referral`} target="_blank" rel="noreferrer">
                Unsplash
              </a>{" "}
              in a new tab, save a photo, and add it with “Choose photo”.
            </Notice>
          )}
          {status === "rate_limited" && <Notice title="Unsplash is busy">The search limit was hit for the moment. Try again in a few minutes.</Notice>}
          {status === "error" && <Notice title="Something went wrong">Could not reach Unsplash, or the photo failed to load. Try again.</Notice>}

          <div className="grid grid-cols-3 gap-2">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p)}
                disabled={picking !== null}
                className="group relative overflow-hidden rounded-xl bg-panel text-left transition active:scale-[0.98] disabled:opacity-60"
                style={{ aspectRatio: "1", backgroundColor: p.color }}
                aria-label={`Use photo by ${p.user.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.small} alt={p.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-[10px] text-white/90">
                  {p.user.name}
                </span>
                {picking === p.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">Loading…</span>
                )}
              </button>
            ))}
          </div>

          {status === "loading" && <p className="py-6 text-center text-sm text-muted">Searching…</p>}
          {status === "ok" && results.length === 0 && <p className="py-6 text-center text-sm text-muted">No photos for “{submitted}”.</p>}
          {status === "ok" && page < totalPages && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => {
                  setStatus("loading");
                  setPage((p) => p + 1);
                }}
              >
                Load more
              </Button>
            </div>
          )}
          {results.length > 0 && (
            <p className="mt-6 text-center text-[11px] text-muted">
              Photos from{" "}
              <a className="underline" href="https://unsplash.com/?utm_source=unfold&utm_medium=referral" target="_blank" rel="noreferrer">
                Unsplash
              </a>
              . Free to use; the photographer is credited on the export page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-line bg-panel p-4 text-sm">
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-muted">{children}</p>
    </div>
  );
}
