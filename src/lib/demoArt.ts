/** Tiny SVG scenes for the landing demo, so the fold animation has something to show before any photo is chosen. */
function svg(w: number, h: number, body: string): string {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;
}

const defs = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1f4a"/><stop offset="0.55" stop-color="#8a3f6a"/><stop offset="1" stop-color="#f5b03d"/></linearGradient>
<linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d2e"/><stop offset="1" stop-color="#0b0b0e"/></linearGradient>
</defs>`;

const scene = (x: number, y: number, s: number) => `
<rect width="100%" height="100%" fill="url(#sky)"/>
<circle cx="${x}" cy="${y}" r="${70 * s}" fill="#ffe6a3" opacity="0.95"/>
<circle cx="${x}" cy="${y}" r="${120 * s}" fill="#ffd27a" opacity="0.18"/>
<path d="M-50 ${y + 330 * s} L${x - 420 * s} ${y + 60 * s} L${x - 170 * s} ${y + 220 * s} L${x + 20 * s} ${y + 80 * s} L${x + 260 * s} ${y + 260 * s} L${x + 520 * s} ${y + 40 * s} L2000 ${y + 360 * s} L2000 2000 L-50 2000 Z" fill="url(#hill)"/>
<path d="M-50 ${y + 480 * s} L${x - 260 * s} ${y + 300 * s} L${x + 90 * s} ${y + 440 * s} L${x + 420 * s} ${y + 280 * s} L2000 ${y + 520 * s} L2000 2000 L-50 2000 Z" fill="#0b0b0e" opacity="0.9"/>`;

export const DEMO_INNER = svg(900, 1000, defs + scene(520, 380, 1));
export const DEMO_COVER = svg(430, 1000, defs + scene(215, 300, 1.35));
