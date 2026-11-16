"use client";

import type { Device } from "@/lib/devices";

export type MockView = "fold" | "both" | "cover" | "inner";

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
  view?: Exclude<MockView, "fold">;
}) {
  const ca = device.cover.w / device.cover.h;
  const ia = device.inner.w / device.inner.h;
  const cols = view === "both" ? `${ca}fr ${ia}fr` : "1fr";
  return (
    <div className="grid items-end gap-4" style={{ gridTemplateColumns: cols }}>
      {view !== "inner" && <Screen size={device.cover} src={cover} label="Cover" showHome={showHome} grid={4} compact={view === "both"} />}
      {view !== "cover" && <Screen size={device.inner} src={inner} label="Inner" showHome={showHome} grid={6} hinge compact={false} />}
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
  compact,
}: {
  size: { w: number; h: number };
  src?: string;
  label: string;
  showHome: boolean;
  grid: number;
  hinge?: boolean;
  compact: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="screen-frame relative w-full overflow-hidden rounded-[9%]" style={{ aspectRatio: `${size.w} / ${size.h}` }}>
        <ScreenContent src={src} label={label} showHome={showHome} grid={grid} hinge={hinge} compact={compact} />
      </div>
      <div className="mt-2 text-center text-xs text-muted">
        {label} · <span className="font-mono">{size.w}×{size.h}</span>
      </div>
    </div>
  );
}

/** The live part of a screen: wallpaper, hinge shadow, optional home-screen overlay. Fills its parent. */
export function ScreenContent({
  src,
  label,
  showHome,
  grid,
  hinge = false,
  compact,
  camera = true,
}: {
  src?: string;
  label: string;
  showHome: boolean;
  grid: number;
  hinge?: boolean;
  compact: boolean;
  camera?: boolean;
}) {
  return (
    <>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${label} wallpaper preview`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="shimmer absolute inset-0 flex items-center justify-center text-xs text-muted">not framed yet</div>
      )}
      {hinge && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[3%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/35 to-transparent" />
      )}
      {showHome && <HomeOverlay grid={grid} compact={compact} />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
      {camera && (
        <div className="pointer-events-none absolute left-1/2 top-[1.5%] w-[1.7%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/15" style={{ aspectRatio: "1" }} />
      )}
    </>
  );
}

function clock() {
  const d = new Date();
  return {
    time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, ""),
    date: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
  };
}

function HomeOverlay({ grid, compact }: { grid: number; compact: boolean }) {
  const icons = Array.from({ length: grid * 2 });
  const { time, date } = clock();
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between px-[7%] pt-[4%] text-[9px] opacity-90 sm:text-[11px]">
        <span>{time}</span>
        <span>▾ ▴ ▮</span>
      </div>
      <div className="mt-[8%] px-[8%]">
        <div className={`font-semibold leading-none ${compact ? "text-[26px] sm:text-[34px]" : "text-[30px] sm:text-[40px]"}`}>{time}</div>
        <div className="mt-1 text-[9px] opacity-85 sm:text-[11px]">{date}</div>
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
