"use client";

import { useState } from "react";

type Guide = { brand: string; title: string; steps: string[]; note?: string };

const GUIDES: Guide[] = [
  {
    brand: "Samsung",
    title: "Samsung Galaxy Z Fold (One UI)",
    steps: [
      "Open Gallery and open the cover image (unfold-cover-…png).",
      "Tap ⋮ (More) → Set as wallpaper.",
      "When asked which screen, choose Cover screen. Pick Lock screen, Home screen, or both, then Done.",
      "Open the inner image (unfold-inner-…png) and repeat, choosing Main screen this time.",
    ],
    note: "You can also go to Settings → Wallpaper and style → Change wallpapers → Gallery. Make sure “Cover screen mirroring” (in Wallpaper and style) is off, or the cover will copy the main screen.",
  },
  {
    brand: "Google",
    title: "Google Pixel Fold",
    steps: [
      "Long-press the home screen → Wallpaper & style → More wallpapers → My photos.",
      "Pick the inner image and position it with the phone open; the picker shows a folded preview too.",
      "Pixel uses one wallpaper for both screens and crops it for the cover. For a genuinely different cover image, use a wallpaper app that supports per-screen wallpapers.",
    ],
  },
  {
    brand: "OnePlus",
    title: "OnePlus Open / Oppo Find N",
    steps: [
      "Settings → Wallpapers & style → Wallpapers → Photos, and pick the inner image with the phone open.",
      "Close the phone (or switch to the Cover screen tab in the picker) and pick the cover image.",
      "Apply each to Lock screen, Home screen, or both.",
    ],
  },
  {
    brand: "Oppo",
    title: "Oppo Find N",
    steps: [
      "Settings → Wallpapers & style → Wallpapers → Photos, and pick the inner image with the phone open.",
      "Switch to the cover screen in the picker (or close the phone) and pick the cover image.",
      "Apply each to Lock screen, Home screen, or both.",
    ],
  },
  {
    brand: "Honor",
    title: "Honor Magic V (MagicOS)",
    steps: [
      "Settings → Home screen & wallpaper → Wallpaper → Gallery.",
      "Pick the inner image with the phone open, then the cover image with it closed, applying each to Lock, Home, or both.",
    ],
  },
  {
    brand: "Other",
    title: "Other folds (Vivo, Huawei, Xiaomi, custom)",
    steps: [
      "Open Settings and search for “Wallpaper”.",
      "Choose a photo from Gallery. Most folds ask which screen to apply it to, or use whichever screen is active when you set it.",
      "Set the inner image with the phone open and the cover image with it closed.",
    ],
  },
];

export function Instructions({ brand }: { brand: string }) {
  const match = GUIDES.find((g) => g.brand === brand) ?? GUIDES[GUIDES.length - 1];
  const [open, setOpen] = useState<string>(match.brand);
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-panel">
      {GUIDES.map((g) => {
        const isOpen = open === g.brand;
        return (
          <div key={g.brand}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? "" : g.brand)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
              aria-expanded={isOpen}
            >
              <span>{g.title}</span>
              <span className="text-muted">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink/90">
                  {g.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                {g.note && <p className="mt-3 text-xs text-muted">{g.note}</p>}
                <p className="mt-3 text-xs text-muted">Menu names move around between software versions; the path is close even when the wording differs.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
