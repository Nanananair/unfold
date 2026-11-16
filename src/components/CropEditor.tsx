"use client";

import Cropper, { type Area, type Point } from "react-easy-crop";
import type { Framing } from "@/lib/types";

export function CropEditor({
  image,
  aspect,
  framing,
  onChange,
  showHinge = false,
}: {
  image: string;
  aspect: number;
  framing: Framing;
  onChange: (patch: Partial<Framing>) => void;
  showHinge?: boolean;
}) {
  return (
    <div className="relative h-[58vh] max-h-[680px] min-h-[320px] w-full overflow-hidden rounded-2xl bg-black">
      <Cropper
        image={image}
        crop={framing.position}
        zoom={framing.zoom}
        rotation={framing.rotation}
        aspect={aspect}
        minZoom={1}
        maxZoom={8}
        objectFit="contain"
        restrictPosition
        showGrid={false}
        mediaProps={{ crossOrigin: "anonymous" }}
        onCropChange={(position: Point) => onChange({ position })}
        onZoomChange={(zoom: number) => onChange({ zoom })}
        onCropComplete={(_: Area, px: Area) => onChange({ pixels: { x: px.x, y: px.y, w: px.width, h: px.height } })}
      />
      {showHinge && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 flex w-0 items-end justify-center">
          <div className="absolute inset-y-0 -left-px w-0.5 bg-white/70 mix-blend-difference" />
          <span className="mb-2 whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">hinge</span>
        </div>
      )}
    </div>
  );
}
