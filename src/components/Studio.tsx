"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { aspect } from "@/lib/devices";
import { fitCrop, rotatedSize } from "@/lib/geometry";
import { loadImage, renderFraming } from "@/lib/render";
import { useStoredDevice } from "@/lib/storage";
import { emptyFraming, recipeInfo, targetSize, type Framing, type Photo, type Recipe, type Rendered, type TargetKey } from "@/lib/types";
import { DeviceStep } from "./DeviceStep";
import { ExportStep } from "./ExportStep";
import { FrameStep, type Source } from "./FrameStep";
import { PhotosStep } from "./PhotosStep";
import { RecipeStep } from "./RecipeStep";
import { Button } from "./ui";

const STEPS = ["Device", "Recipe", "Photos", "Frame", "Preview"] as const;
type Step = 0 | 1 | 2 | 3 | 4;

export default function Studio() {
  const [device, setDevice] = useStoredDevice();
  const [step, setStep] = useState<Step>(0);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [photos, setPhotos] = useState<(Photo | null)[]>([null, null]);
  const [framing, setFraming] = useState<Record<TargetKey, Framing>>({ cover: emptyFraming(), inner: emptyFraming() });
  const [active, setActive] = useState<TargetKey>("inner");
  const [mirror, setMirror] = useState(false);
  const [renders, setRenders] = useState<Partial<Record<TargetKey, Rendered>>>({});

  const info = recipe ? recipeInfo(recipe) : null;

  const innerSource: Source | null = useMemo(() => {
    if (!info) return null;
    return info.photos === 2 ? photos[1] : photos[0];
  }, [info, photos]);

  const coverSource: Source | null = useMemo(() => {
    if (!info) return null;
    if (info.photos === 2) return photos[0];
    return renders.inner ? { url: renders.inner.url, size: renders.inner.size } : null;
  }, [info, photos, renders.inner]);

  const patchFraming = useCallback((k: TargetKey, patch: Partial<Framing>) => {
    setFraming((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  }, []);

  function chooseRecipe(r: Recipe) {
    const ri = recipeInfo(r);
    setRecipe(r);
    setFraming({ cover: emptyFraming(), inner: emptyFraming(ri.defaultRotation) });
    setMirror(false);
    setActive(ri.order[0]);
  }

  function changePhoto(i: number, p: Photo | null) {
    setPhotos((prev) => {
      const old = prev[i];
      if (old && old.url !== p?.url) setTimeout(() => URL.revokeObjectURL(old.url), 5000);
      const next = [...prev];
      next[i] = p;
      return next;
    });
    const ri = recipe ? recipeInfo(recipe) : null;
    if (!ri) return;
    if (ri.photos === 1) {
      setFraming({ cover: emptyFraming(), inner: emptyFraming(ri.defaultRotation) });
    } else {
      patchFraming(i === 0 ? "cover" : "inner", emptyFraming());
    }
  }

  // Render a target whenever its source or framing changes. "busy" is derived:
  // a render is pending while the stored render's inputKey differs from what we want now.
  const useRender = (key: TargetKey, source: Source | null, f: Framing, extra: { mirror?: boolean }, onDone?: () => void) => {
    const target = targetSize(device, key);
    const px = f.pixels ?? (source ? fitCrop(rotatedSize(source.size, f.rotation), aspect(target)) : null);
    const inputKey = source && px ? `${source.url}|${px.x},${px.y},${px.w},${px.h}|${f.rotation}|${target.w}x${target.h}|${extra.mirror ? "m" : ""}` : "";
    useEffect(() => {
      if (!source || !px) return;
      let cancelled = false;
      loadImage(source.url)
        .then((img) => renderFraming(img, px, f.rotation, target, extra))
        .then((blob) => {
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          setRenders((prev) => {
            const old = prev[key];
            if (old) setTimeout(() => URL.revokeObjectURL(old.url), 5000);
            return { ...prev, [key]: { blob, url, size: target, inputKey } };
          });
          onDone?.();
        })
        .catch((e) => console.error(e));
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputKey]);
    return inputKey !== "" && renders[key]?.inputKey !== inputKey;
  };

  const innerBusy = useRender("inner", innerSource, framing.inner, { mirror: recipe === "mirror" && mirror }, () => {
    // In one-image recipes the cover slices the inner render, so its framing starts over.
    if (info?.photos === 1) setFraming((prev) => ({ ...prev, cover: emptyFraming() }));
  });
  const coverBusy = useRender("cover", coverSource, framing.cover, {});
  const busy = { inner: innerBusy, cover: coverBusy };

  const canNext: Record<Step, boolean> = {
    0: true,
    1: recipe !== null,
    2: !!info && info.photoLabels.every((_, i) => !!photos[i]),
    3: !!renders.cover && !!renders.inner && !busy.cover && !busy.inner,
    4: false,
  };

  function next() {
    if (step === 3 && info && active === info.order[0]) {
      setActive(info.order[1]);
      return;
    }
    setStep((s) => Math.min(4, s + 1) as Step);
  }
  function back() {
    if (step === 3 && info && active === info.order[1]) {
      setActive(info.order[0]);
      return;
    }
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  const nextLabel = step === 3 && info && active === info.order[0] ? `Next: ${info.order[1]} screen` : "Next";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight">Unfold</div>
          <div className="text-xs text-muted">Wallpapers that make sense on both screens</div>
        </div>
        <div className="text-right text-xs text-muted">
          <div className="font-medium text-ink">{device.name}</div>
          {step > 0 && (
            <button type="button" className="underline" onClick={() => setStep(0)}>
              change
            </button>
          )}
        </div>
      </header>

      <nav className="mb-6 flex gap-1" aria-label="Steps">
        {STEPS.map((s, i) => {
          const reachable = i <= step;
          return (
            <button
              key={s}
              type="button"
              disabled={!reachable}
              onClick={() => setStep(i as Step)}
              className={`flex-1 rounded-full py-1 text-[11px] ${i === step ? "bg-accent text-accent-ink" : reachable ? "bg-panel-2 text-ink" : "bg-panel text-muted"}`}
            >
              {s}
            </button>
          );
        })}
      </nav>

      <main className="flex-1">
        {step === 0 && <DeviceStep device={device} onChange={setDevice} />}
        {step === 1 && <RecipeStep recipe={recipe} onChange={chooseRecipe} />}
        {step === 2 && recipe && <PhotosStep recipe={recipe} device={device} photos={photos} onChange={changePhoto} />}
        {step === 3 && recipe && (
          <FrameStep
            recipe={recipe}
            device={device}
            active={active}
            onActive={setActive}
            sources={{ cover: coverSource, inner: innerSource }}
            framing={framing}
            onFraming={patchFraming}
            mirror={mirror}
            onMirror={setMirror}
          />
        )}
        {step === 4 && <ExportStep device={device} renders={renders} />}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-2xl gap-2 px-4">
          <Button onClick={back} disabled={step === 0} className="w-28">
            Back
          </Button>
          {step < 4 && (
            <Button variant="primary" onClick={next} disabled={!canNext[step]} className="flex-1">
              {busy.cover || busy.inner ? "Rendering…" : nextLabel}
            </Button>
          )}
          {step === 4 && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setStep(1);
              }}
            >
              Make another
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
