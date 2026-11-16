"use client";

import { useMemo, useState } from "react";
import type { Device } from "@/lib/devices";
import { canShareFiles, downloadBlob } from "@/lib/render";
import type { Rendered, TargetKey } from "@/lib/types";
import { FoldPreview } from "./FoldPreview";
import { Instructions } from "./Instructions";
import { PhoneMock, type MockView } from "./PhoneMock";
import { Button, Heading } from "./ui";

export function ExportStep({ device, renders }: { device: Device; renders: Partial<Record<TargetKey, Rendered>> }) {
  const [showHome, setShowHome] = useState(true);
  const [view, setView] = useState<MockView>("fold");
  const [open, setOpen] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const files = useMemo(() => {
    const out: File[] = [];
    if (renders.cover) out.push(new File([renders.cover.blob], fileName("cover", device), { type: "image/png" }));
    if (renders.inner) out.push(new File([renders.inner.blob], fileName("inner", device), { type: "image/png" }));
    return out;
  }, [renders.cover, renders.inner, device]);

  // This step is only ever mounted after user interaction, so reading navigator here is hydration-safe.
  const shareOk = useMemo(() => files.length > 0 && canShareFiles(files), [files]);

  async function share() {
    try {
      await navigator.share({ files, title: "Unfold wallpapers" });
      setStatus("Shared. Pick Gallery (or your Photos app) to save both images, then set them from there.");
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") setStatus("Sharing failed on this browser. Use the download buttons instead.");
    }
  }

  const ready = !!renders.cover && !!renders.inner;

  return (
    <div>
      <Heading title="Preview & export" sub="Both images are rendered at your phone's native resolution." />

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex rounded-xl border border-line bg-panel p-0.5 text-xs">
          {(["fold", "both", "cover", "inner"] as MockView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${view === v ? "bg-panel-2 text-ink" : "text-muted hover:text-ink"}`}
            >
              {v}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={showHome} onChange={(e) => setShowHome(e.target.checked)} className="accent-accent" />
          Home screen
        </label>
      </div>

      {view === "fold" ? (
        <div className="rounded-3xl border border-line bg-gradient-to-b from-panel to-bg p-4">
          <FoldPreview device={device} cover={renders.cover?.url} inner={renders.inner?.url} showHome={showHome} open={open} animate={!scrubbing} />
          <div className="mt-4 flex items-center gap-3">
            <span className="w-12 text-right text-[11px] text-muted">Closed</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(open * 100)}
              onChange={(e) => setOpen(Number(e.target.value) / 100)}
              onPointerDown={() => setScrubbing(true)}
              onPointerUp={() => setScrubbing(false)}
              onPointerCancel={() => setScrubbing(false)}
              className="fold-slider flex-1"
              aria-label="Fold angle"
            />
            <span className="w-12 text-[11px] text-muted">Open</span>
          </div>
          <div className="mt-3 flex justify-center">
            <Button className="px-5 py-2" onClick={() => setOpen(open < 0.5 ? 1 : 0)}>
              {open < 0.5 ? "Unfold" : "Fold"}
            </Button>
          </div>
        </div>
      ) : (
        <PhoneMock device={device} cover={renders.cover?.url} inner={renders.inner?.url} showHome={showHome} view={view} />
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        {shareOk && (
          <Button variant="primary" className="col-span-2" onClick={share} disabled={!ready}>
            Share both to Gallery
          </Button>
        )}
        <Button variant={shareOk ? "secondary" : "primary"} disabled={!renders.cover} onClick={() => renders.cover && downloadBlob(renders.cover.blob, fileName("cover", device))}>
          Download cover
        </Button>
        <Button variant={shareOk ? "secondary" : "primary"} disabled={!renders.inner} onClick={() => renders.inner && downloadBlob(renders.inner.blob, fileName("inner", device))}>
          Download inner
        </Button>
      </div>
      {status && <p className="mt-2 text-xs text-muted">{status}</p>}
      <p className="mt-3 text-xs text-muted">
        No website can change an Android wallpaper directly, so the last step happens in your phone&apos;s settings. It takes about
        thirty seconds:
      </p>

      <div className="mt-4">
        <Instructions brand={device.brand} />
      </div>
    </div>
  );
}

function fileName(key: TargetKey, device: Device) {
  const s = key === "cover" ? device.cover : device.inner;
  return `unfold-${key}-${s.w}x${s.h}.png`;
}
