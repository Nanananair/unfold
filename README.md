# Unfold

Wallpapers that make sense on both screens of a foldable phone.

Book-style folds have a tall cover screen and a near-square inner screen, and
nothing in the stock wallpaper picker helps you compose a *pair* that belong
together. Unfold lets you bring your own photos, frame each screen, preview
both with a home-screen overlay, and export PNGs at your phone's exact
resolution. Everything runs in the browser; photos never leave the device.

## Recipes

- **Split scene** – the whole wide shot inside, a tall slice around the focal
  point on the cover. Closing the phone zooms in.
- **Day / night pair** – two shots of the same view (or a bud and a bloom).
  Day on the cover, night inside.
- **Symmetry on the crease** – a reflection, rotated so the waterline runs
  down the hinge, with an optional perfect mirror.

## Devices

Presets for the Samsung Galaxy Z Fold 3–8 Ultra, Pixel Fold / 9 Pro Fold /
10 Pro Fold, OnePlus Open, Oppo Find N5, Honor Magic V3/V5, Vivo X Fold 5,
Huawei Mate X6 and Xiaomi Mix Fold 4, plus custom sizes. The table lives in
`src/lib/devices.ts`; add a line to support a new phone.

## Unsplash search (optional)

The photo step can search Unsplash's free library in place. Create an app at
<https://unsplash.com/developers>, copy its Access Key, and set
`UNSPLASH_ACCESS_KEY` (locally in `.env.local`, on Vercel under Project →
Settings → Environment Variables). Without the key the button still shows but
explains that search isn't configured and links to Unsplash instead. The key
never reaches the browser: `/api/unsplash/search` proxies the query and
`/api/unsplash/download` registers each pick, as Unsplash's API guidelines
require. Photographers are credited in the photo step and on the export page.

## Setting the wallpaper

No website can change an Android wallpaper directly. Unfold gets you as close
as the platform allows: one tap to share both images to Gallery (Web Share
API) or download them, then a short per-brand walkthrough of the Wallpaper
settings.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest, pure logic
npm run lint
npm run build
```

Next.js App Router, Tailwind v4, `react-easy-crop` for the framing editor,
canvas for rendering. Deploys to Vercel with no configuration.

Design notes: `docs/superpowers/specs/2026-11-16-unfold-wallpaper-studio-design.md`.
