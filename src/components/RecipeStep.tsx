"use client";

import { RECIPES, type Recipe } from "@/lib/types";
import { Card, Heading } from "./ui";

export function RecipeStep({ recipe, onChange }: { recipe: Recipe | null; onChange: (r: Recipe) => void }) {
  return (
    <div>
      <Heading title="Pick a recipe" sub="Three ways to make the two screens feel like one idea." />
      <div className="space-y-3">
        {RECIPES.map((r) => (
          <Card key={r.id} selected={recipe === r.id} onClick={() => onChange(r.id)}>
            <div className="flex items-start gap-4">
              <RecipeGlyph id={r.id} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{r.title}</div>
                <div className="mt-0.5 text-sm text-muted">{r.tagline}</div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{r.tip}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.searchTerms.map((t) => (
                    <a
                      key={t}
                      href={`https://unsplash.com/s/photos/${encodeURIComponent(t)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full border border-line bg-panel-2 px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-ink"
                    >
                      “{t}” ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Search-term chips open Unsplash in a new tab. Save a photo you like, then come back and add it in the next step.
      </p>
    </div>
  );
}

function RecipeGlyph({ id }: { id: Recipe }) {
  // cover 24x56, inner 50x56 with hinge
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1 };
  return (
    <svg width={84} height={56} viewBox="0 0 84 56" aria-hidden className="shrink-0 text-muted">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f5b03d" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f5b03d" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x={0.5} y={0.5} width={23} height={55} rx={4} {...common} />
      <rect x={33.5} y={0.5} width={50} height={55} rx={4} {...common} />
      <line x1={58.5} y1={3} x2={58.5} y2={53} stroke="currentColor" strokeDasharray="2 2" />
      {id === "split" && (
        <>
          <path d="M35 44 L47 26 L54 36 L62 20 L72 34 L82 44 Z" fill={`url(#g-${id})`} />
          <path d="M2 44 L8 26 L12 36 L16 30 L22 44 Z" fill={`url(#g-${id})`} />
        </>
      )}
      {id === "pair" && (
        <>
          <circle cx={12} cy={16} r={6} fill="#f5b03d" />
          <path d="M2 44 L10 30 L16 38 L22 44 Z" fill={`url(#g-${id})`} />
          <rect x={34} y={1} width={49} height={54} rx={3} fill="#f5b03d" fillOpacity={0.08} />
          <circle cx={70} cy={14} r={5} fill="none" stroke="#f5b03d" />
          <path d="M35 44 L45 32 L52 40 L60 28 L70 38 L82 44 Z" fill={`url(#g-${id})`} />
        </>
      )}
      {id === "mirror" && (
        <>
          <path d="M35 20 L45 10 L52 18 L58 6 L58 50 L52 38 L45 46 L35 36 Z" fill={`url(#g-${id})`} />
          <path d="M82 20 L72 10 L65 18 L59 6 L59 50 L65 38 L72 46 L82 36 Z" fill={`url(#g-${id})`} opacity={0.6} />
          <path d="M2 24 L8 14 L12 22 L12 34 L8 42 L2 32 Z" fill={`url(#g-${id})`} />
          <path d="M22 24 L16 14 L12 22 L12 34 L16 42 L22 32 Z" fill={`url(#g-${id})`} opacity={0.6} />
        </>
      )}
    </svg>
  );
}
