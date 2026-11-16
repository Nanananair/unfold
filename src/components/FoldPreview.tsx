"use client";

import { useEffect, useRef, useState } from "react";
import type { Device } from "@/lib/devices";
import { ScreenContent } from "./PhoneMock";

/**
 * A 3D model of the phone: the left half stays put, the right half swings on
 * the hinge toward the viewer. Its back carries the cover screen, so at
 * `open = 0` you see the cover and at `open = 1` the full inner screen.
 */
export function FoldPreview({
  device,
  cover,
  inner,
  showHome,
  open,
  animate = true,
  maxWidth = 440,
  className = "",
}: {
  device: Device;
  cover?: string;
  inner?: string;
  showHome: boolean;
  /** 0 = closed, 1 = fully open. */
  open: number;
  /** Ease between values (off while scrubbing a slider). */
  animate?: boolean;
  maxWidth?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const t = Math.min(1, Math.max(0, open));
  const ia = device.inner.w / device.inner.h;
  const ca = device.cover.w / device.cover.h;
  const stageW = Math.min(width || maxWidth, maxWidth);
  const innerW = stageW * 0.86;
  const halfW = innerW / 2;
  const innerH = innerW / ia;
  const coverW = Math.min(halfW, innerH * ca);
  const angle = -180 * (1 - t);
  const ease = animate ? "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
  const shade = Math.sin(Math.PI * (1 - t)); // 0 at either end, 1 mid-fold
  const radius = Math.round(innerW * 0.045);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      <div className="relative mx-auto" style={{ width: stageW, height: innerH + 28, perspective: 1800 }}>
        {/* floor shadow */}
        <div
          className="absolute left-1/2 top-full h-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/70 blur-md"
          style={{ width: innerW * (0.55 + 0.45 * t), transition: animate ? "width 1.1s cubic-bezier(0.22, 1, 0.36, 1)" : "none" }}
        />
        {/* assembly, shifted so the visual centre stays put as it folds */}
        <div
          className="absolute top-3"
          style={{
            left: (stageW - innerW) / 2,
            width: innerW,
            height: innerH,
            transform: `translateX(${(halfW / 2) * (1 - t)}px)`,
            transition: ease,
            transformStyle: "preserve-3d",
          }}
        >
          {/* left half */}
          <div
            className="screen-frame absolute left-0 top-0 overflow-hidden"
            style={{ width: halfW, height: innerH, borderRadius: `${radius}px 0 0 ${radius}px`, borderRight: 0 }}
          >
            <div className="absolute left-0 top-0" style={{ width: innerW, height: innerH }}>
              <ScreenContent src={inner} label="Inner" showHome={showHome} grid={6} hinge compact={false} />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black to-transparent" style={{ opacity: 0.55 * shade }} />
          </div>

          {/* right half, hinged on its left edge */}
          <div
            className="absolute top-0"
            style={{
              left: halfW,
              width: halfW,
              height: innerH,
              transformOrigin: "left center",
              transform: `rotateY(${angle}deg)`,
              transition: ease,
              transformStyle: "preserve-3d",
            }}
          >
            {/* front: right half of the inner screen */}
            <div
              className="screen-frame absolute inset-0 overflow-hidden [backface-visibility:hidden]"
              style={{ borderRadius: `0 ${radius}px ${radius}px 0`, borderLeft: 0 }}
            >
              <div className="absolute top-0" style={{ left: -halfW, width: innerW, height: innerH }}>
                <ScreenContent src={inner} label="Inner" showHome={showHome} grid={6} hinge compact={false} camera={false} />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0.5 * shade }} />
            </div>
            {/* back: the cover screen */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-[#101014] [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)", borderRadius: `${radius}px 0 0 ${radius}px` }}
            >
              <div className="screen-frame relative overflow-hidden" style={{ width: coverW, height: innerH, borderRadius: radius }}>
                <ScreenContent src={cover} label="Cover" showHome={showHome} grid={4} compact />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0.35 * shade, borderRadius: `${radius}px 0 0 ${radius}px` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Self-driving fold loop for the landing screen. Honors prefers-reduced-motion. */
export function FoldDemo({ device, cover, inner, className = "" }: { device: Device; cover?: string; inner?: string; className?: string }) {
  const [open, setOpen] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setOpen(1), 0);
      return () => clearTimeout(t);
    }
    let on = false;
    const first = setTimeout(() => {
      on = true;
      setOpen(1);
    }, 600);
    const loop = setInterval(() => {
      on = !on;
      setOpen(on ? 1 : 0);
    }, 3200);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, []);
  return <FoldPreview device={device} cover={cover} inner={inner} showHome={false} open={open} maxWidth={300} className={className} />;
}
