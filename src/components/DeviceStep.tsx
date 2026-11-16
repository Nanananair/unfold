"use client";

import { useState } from "react";
import { CUSTOM_DEVICE_ID, DEVICES, formatSize, makeCustomDevice, type Device } from "@/lib/devices";
import { Card, Heading } from "./ui";

export function DeviceStep({ device, onChange }: { device: Device; onChange: (d: Device) => void }) {
  const [custom, setCustom] = useState({
    cw: device.cover.w,
    ch: device.cover.h,
    iw: device.inner.w,
    ih: device.inner.h,
  });
  const brands = Array.from(new Set(DEVICES.map((d) => d.brand)));
  const isCustom = device.id === CUSTOM_DEVICE_ID;

  function applyCustom(next: typeof custom) {
    setCustom(next);
    if ([next.cw, next.ch, next.iw, next.ih].every((n) => Number.isFinite(n) && n >= 200 && n <= 8000)) {
      onChange(makeCustomDevice({ w: next.cw, h: next.ch }, { w: next.iw, h: next.ih }));
    }
  }

  return (
    <div>
      <Heading title="Which fold?" sub="Wallpapers get exported at this phone's exact pixel size." />
      <div className="space-y-5">
        {brands.map((brand) => (
          <div key={brand}>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{brand}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEVICES.filter((d) => d.brand === brand).map((d) => (
                <Card key={d.id} selected={device.id === d.id} onClick={() => onChange(d)} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{d.name}</div>
                    <ScreenGlyph device={d} />
                  </div>
                  <div className="mt-1 font-mono text-xs text-muted">
                    cover {formatSize(d.cover)} · inner {formatSize(d.inner)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Not listed</div>
          <Card selected={isCustom} className="py-3">
            <div className="font-medium">Custom sizes</div>
            <p className="mt-1 text-xs text-muted">
              Find your panel resolutions on the spec sheet (or GSMArena). Width first, in the orientation you hold the
              phone.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <SizeInput label="Cover" w={custom.cw} h={custom.ch} onChange={(w, h) => applyCustom({ ...custom, cw: w, ch: h })} />
              <SizeInput label="Inner" w={custom.iw} h={custom.ih} onChange={(w, h) => applyCustom({ ...custom, iw: w, ih: h })} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SizeInput({ label, w, h, onChange }: { label: string; w: number; h: number; onChange: (w: number, h: number) => void }) {
  const cls = "w-full rounded-lg border border-line bg-bg px-2 py-2 font-mono text-sm text-ink outline-none focus:border-accent";
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <input className={cls} type="number" inputMode="numeric" value={w} onChange={(e) => onChange(Number(e.target.value), h)} aria-label={`${label} width`} />
        <span className="text-muted">×</span>
        <input className={cls} type="number" inputMode="numeric" value={h} onChange={(e) => onChange(w, Number(e.target.value))} aria-label={`${label} height`} />
      </div>
    </label>
  );
}

/** Tiny silhouette of the two screens, to scale. */
export function ScreenGlyph({ device }: { device: Device }) {
  const H = 22;
  const cw = (device.cover.w / device.cover.h) * H;
  const iw = (device.inner.w / device.inner.h) * H;
  return (
    <svg width={cw + iw + 6} height={H} aria-hidden className="shrink-0 text-muted">
      <rect x={0.5} y={0.5} width={cw - 1} height={H - 1} rx={2.5} fill="none" stroke="currentColor" />
      <rect x={cw + 6.5} y={0.5} width={iw - 1} height={H - 1} rx={2.5} fill="none" stroke="currentColor" />
      <line x1={cw + 6 + iw / 2} y1={2} x2={cw + 6 + iw / 2} y2={H - 2} stroke="currentColor" strokeDasharray="2 2" />
    </svg>
  );
}
