# Unfold: wallpaper studio for foldable phones

Date: 2026-11-16

## Intent

Book-style foldables have two screens with wildly different shapes: a tall
narrow cover screen (roughly 21:9) and a near-square inner screen. Nothing
in the stock wallpaper picker helps you compose a *pair* of wallpapers that
belong together. Unfold is a website where a user brings their own photos,
previews how a pair will look on both screens of their exact device, and
exports both images at the device's native pixel size, ready to set.

The owner's device is a Samsung Galaxy Z Fold 8 Ultra; the site must work
for any fold.

## Goals

- Pick a device (preset list, or custom pixel sizes) and remember it.
- Three composition recipes, as described by the owner:
  1. **Split-scene ("zoom out")**: one wide image. Inner screen gets the
     whole shot; cover screen gets a tall slice around the focal point.
  2. **Pair**: two images (day/night, bud/bloom). Cover gets A, inner gets B.
  3. **Symmetry around the crease**: one reflective image, rotated so the
     waterline runs down the hinge; hinge guide shown while framing.
- Live preview of both screens, with the hinge line drawn on the inner
  screen and an optional home-screen overlay (clock, app grid) so the user
  can judge legibility.
- Export both images as PNG at exact device resolution: Download, and Share
  (Web Share API with files) on phones that support it.
- Step-by-step instructions for setting cover and inner wallpapers on
  One UI, Pixel, OnePlus/Oppo and Honor.
- Installable as a PWA so it feels like a tool, not a web page.
- Everything runs client-side. Photos never leave the phone.

## Non-goals

- Setting the wallpaper directly. No web API can do that on Android; the
  UI says so and gets the user as close as the platform allows.
- Hosting or searching stock photos. The search-term suggestions from the
  owner's notes are shown as hints linking to Unsplash; an in-app Unsplash
  search is left as a follow-up (would need an API key and a server route).
- Accounts, saving projects to a server, sharing projects.

## Anti-goals

- Blurry output. Export must be pixel-exact for the chosen device.
- A desktop-only editor. Primary use is on the phone itself, with touch.

## Constraints

- Deploys on Vercel with zero config.
- No server state. Any server code is optional (future image search).
- Device spec table must be easy to extend; it will go stale.

## Approaches considered

1. **Next.js (App Router) + Tailwind, all client-side canvas.** Vercel's
   native framework, zero-config deploy, room for an optional API route
   later (stock-photo search). Slightly heavier than a static bundle.
2. **Vite + React static site.** Lighter and simpler, also zero-config on
   Vercel, but adding a server route later means a second project or
   Vercel functions wired by hand.
3. **Plain HTML + vanilla JS.** Smallest, but the crop editor and state
   management get painful quickly.

Picked **1** (my call): the owner asked for Vercel and mentioned stock
search terms, so leaving a clean path to a server route is worth the
small weight.

## Design

### Data model

- `Device { id, brand, name, cover: {w,h}, inner: {w,h} }`. Presets in
  `src/lib/devices.ts`. Custom device stored in localStorage.
- `Recipe = 'split' | 'pair' | 'mirror'`.
- `Layer { file, objectUrl, naturalSize }` per source image (1 or 2).
- `Framing { crop: {x,y,w,h} in source pixels, rotation: 0|90|180|270 }`
  per target screen (cover, inner). Produced by the crop editor.
- Project state lives in a React context; persisted framing is not needed
  for v1.

### Flow (single page, stepper)

1. **Device**: choose preset or custom size. Shows the two aspect ratios.
2. **Recipe**: three cards with a tiny diagram and the owner's search-term
   hints.
3. **Photos**: one or two file inputs depending on recipe.
4. **Frame**: for each target screen, a `react-easy-crop` editor locked to
   that screen's aspect, with rotate button and hinge guide (for inner).
   Split recipe: inner is framed first, then the cover crop is constrained
   to lie inside the inner crop so the "zoom out" relationship holds.
5. **Preview**: both screens rendered side by side in a phone mock, hinge
   line on the inner screen, "show home screen" toggle.
6. **Export**: Download cover / Download inner / Download both, Share
   buttons, then the per-brand instructions.

### Rendering

`renderTarget(image, framing, targetSize) -> Blob` in `src/lib/render.ts`:
draws the crop region onto an offscreen canvas of exactly `targetSize`,
applying rotation. Pure crop/aspect math lives in `src/lib/geometry.ts`
and is unit-tested with Vitest.

### What's left to the builder

- Visual styling details (dark, calm, phone-first).
- Exact wording of the per-brand instructions.
- PWA icon artwork.
