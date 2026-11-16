"use client";

import type { Device } from "@/lib/devices";

export type MockView = "both" | "cover" | "inner";

export function PhoneMock({
  device,
  cover,
  inner,
  showHome,
  view = "both",
}: {
  device: Device;
  cover?: string;
  inner?: string;
  showHome: boolean;
  view?: MockView;
}) {
  const ca = device.cover.w / device.cover.h;
  const ia = device.inner.w / device.inner.h;
  const cols = view === "both" ? `${ca}fr ${ia}fr` : "1fr";
  return (
    <div className="grid items-end gap-4" style={{ gridTemplateColumns: cols }}>
      {view !== "inner" && (
        <Screen size={device.cover} src={cover} label="Cover" showHome={showHome} grid={4} narrow={view === "both"} />
      )}
      {view !== "cover" && (
        <Screen size={device.inner} src={inner} label="Inner" showHome={showHome} grid={6} hinge narrow={false} />
      )}
    </div>
  );
}

function Screen({
  size,
  src,
  label,
  showHome,
  grid,
  hinge = false,
  narrow,
}: {
  size: { w: number; h: number };
  src?: string;
  label: string;
  showHome: boolean;
  grid: number;
  hinge?: boolean;
  narrow: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        className="relative w-full overflow-hidden rounded-[9%] border-[3px] border-line bg-black shadow-2xl shadow-black/60"
        style={{ aspectRatio: `${size.w} / ${size.h}` }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${label} wallpaper preview`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">not framed yet</div>
        )}
        {hinge && (
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[2.5%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/35 to-transparent" />
        )}
        {showHome && <HomeOverlay grid={grid} compact={narrow} />}
        <div className="pointer-events-none absolute left-1/2 top-[1.5%] h-[1.6%] w-[1.6%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" style={{ aspectRatio: "1" }} />
      </div>
      <div className="mt-2 text-center text-xs text-muted">
        {label} · <span className="font-mono">{size.w}×{size.h}</span>
      </div>
    </div>
  );
}

function HomeOverlay({ grid, compact }: { grid: number; compact: boolean }) {
  const icons = Array.from({ length: grid * (compact ? 2 : 2) });
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between px-[7%] pt-[4%] text-[9px] opacity-90 sm:text-[11px]">
        <span>10:08</span>
        <span>▾ ▴ ▮</span>
      </div>
      <div className="mt-[8%] px-[8%]">
        <div className={`font-semibold leading-none ${compact ? "text-[26px] sm:text-[34px]" : "text-[30px] sm:text-[40px]"}`}>10:08</div>
        <div className="mt-1 text-[9px] opacity-85 sm:text-[11px]">Sun, 16 Nov</div>
      </div>
      <div className="mt-auto px-[8%] pb-[6%]">
        <div className="grid gap-[9%]" style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}>
          {icons.map((_, i) => (
            <div key={i} className="aspect-square rounded-[26%] bg-white/25 ring-1 ring-white/20 backdrop-blur-sm" />
          ))}
        </div>
        <div className="mt-[8%] flex justify-around rounded-full bg-white/15 p-[3%] backdrop-blur-sm">
          {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
            <div key={i} className="aspect-square w-[14%] rounded-[26%] bg-white/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
