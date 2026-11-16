import type { Device, Size } from "./devices";
import type { Rect, Rotation } from "./geometry";

export type Recipe = "split" | "pair" | "mirror";
export type TargetKey = "cover" | "inner";

export type Photo = {
  url: string;
  name: string;
  size: Size;
};

export type Framing = {
  position: { x: number; y: number };
  zoom: number;
  rotation: Rotation;
  /** Crop rect in rotated-image pixels; null until the editor reports one. */
  pixels: Rect | null;
};

export type Rendered = {
  blob: Blob;
  url: string;
  size: Size;
  /** Fingerprint of the inputs this was rendered from. */
  inputKey: string;
};

export type RecipeInfo = {
  id: Recipe;
  title: string;
  tagline: string;
  photos: 1 | 2;
  /** Order in which the screens get framed. */
  order: TargetKey[];
  photoLabels: string[];
  defaultRotation: Rotation;
  searchTerms: string[];
  tip: string;
};

export const RECIPES: RecipeInfo[] = [
  {
    id: "split",
    title: "Split scene",
    tagline: "Whole wide shot inside, the strongest detail on the cover.",
    photos: 1,
    order: ["inner", "cover"],
    photoLabels: ["Wide photo"],
    defaultRotation: 0,
    searchTerms: ["Himalaya panorama", "Western Ghats monsoon", "Ladakh road panorama"],
    tip: "Works best with one clear focal point: a peak, a lone tree, a rider on the road. Opening the phone feels like zooming out.",
  },
  {
    id: "pair",
    title: "Day / night pair",
    tagline: "Two shots of the same view. Day on the cover, night inside.",
    photos: 2,
    order: ["cover", "inner"],
    photoLabels: ["Cover photo (day, or the bud)", "Inner photo (night, or the bloom)"],
    defaultRotation: 0,
    searchTerms: ["Mumbai Marine Drive day night", "Bandra-Worli Sea Link day night", "same view day and night", "lotus bud", "lotus bloom"],
    tip: "Easy to shoot yourself: the same view from your balcony at noon and at night. Flower version: a bud outside, the open bloom inside.",
  },
  {
    id: "mirror",
    title: "Symmetry on the crease",
    tagline: "A reflection, turned so the waterline runs down the hinge.",
    photos: 1,
    order: ["inner", "cover"],
    photoLabels: ["Reflection photo"],
    defaultRotation: 90,
    searchTerms: ["mountain lake reflection", "mirror lake sunrise", "still water reflection symmetry"],
    tip: "Mountain-lake reflections are ideal. The photo starts rotated 90° so the waterline lines up with the hinge, which makes the crease feel deliberate.",
  },
];

export function recipeInfo(id: Recipe): RecipeInfo {
  return RECIPES.find((r) => r.id === id)!;
}

export function targetSize(device: Device, key: TargetKey): Size {
  return key === "cover" ? device.cover : device.inner;
}

export const emptyFraming = (rotation: Rotation = 0): Framing => ({
  position: { x: 0, y: 0 },
  zoom: 1,
  rotation,
  pixels: null,
});
