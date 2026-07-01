import type { ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * Icon tiles — 28×28 rounded squares (concentric radius 6) holding a
 * glyph, with a subtle inset ring so they feel crisp (skill: image
 * outline / subtle 1px overlay). Glyphs are deliberately simple.
 * ------------------------------------------------------------------ */

function Tile({
  children,
  bg,
  ring = "rgba(0,0,0,0.08)",
  size = 28,
}: {
  children: ReactNode;
  bg: string;
  ring?: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: bg,
        boxShadow: `inset 0 0 0 1px ${ring}, 0 1px 1.5px rgba(0,0,0,0.04)`,
      }}
    >
      {children}
    </span>
  );
}

/** Radial loading / starburst glyph — 12 uniform gray spokes. */
export function Starburst({ size = 19 }: { size?: number }) {
  const spokes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      {spokes.map((i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 10 + Math.cos(a) * 3.1;
        const y1 = 10 + Math.sin(a) * 3.1;
        const x2 = 10 + Math.cos(a) * 6.3;
        const y2 = 10 + Math.sin(a) * 6.3;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#A8A8A8"
            strokeWidth={1.35}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** door.link — pale tile with a small black keyhole figure. */
export function DoorIcon() {
  return (
    <Tile bg="#F2F2F2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="10.6" r="3.05" fill="#141414" />
        <path
          d="M11.15 20.2 L12.7 13.9 H15.3 L16.85 20.2 Z"
          fill="#141414"
        />
      </svg>
    </Tile>
  );
}

/** Campfire — warm orange tile with a darker droplet-flame. */
export function CampfireIcon() {
  return (
    <Tile bg="#FDBA63" ring="rgba(0,0,0,0.06)">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 7.6 C 18.6 12.4 17.5 18.6 14 20.4 C 10.5 18.6 9.4 12.4 14 7.6 Z"
          fill="#CE6E24"
        />
      </svg>
    </Tile>
  );
}

/** vita — pale gray-blue tile with a diagonal leaf. */
export function VitaIcon() {
  return (
    <Tile bg="#E3E7EC">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M8.8 19.2 C 8.8 12.9 12.9 8.8 19.2 8.8 C 19.2 15.1 15.1 19.2 8.8 19.2 Z"
          fill="#8C97A4"
        />
        <path
          d="M10.6 17.4 L16.9 11.1"
          stroke="#F1F3F5"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    </Tile>
  );
}

/* ------------------------------------------------------------------ *
 * Ship sigils — dark tiles with white geometric quadrant marks
 * (matching the attached reference). Three distinct but systematic.
 * ------------------------------------------------------------------ */

const SIGILS: ReactNode[] = [
  // ~foddur-hodler — opposing corner triangles + a floating square
  <svg key="0" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path d="M6 6 H15 L6 15 Z" fill="#F4F4F4" />
    <path d="M22 22 H13 L22 13 Z" fill="#F4F4F4" />
    <rect x="16.4" y="6" width="5.6" height="5.6" rx="0.8" fill="#F4F4F4" />
    <rect x="6" y="16.4" width="5.6" height="5.6" rx="0.8" fill="#8A8A8A" />
  </svg>,
  // ~toptyr-bilder — half disc + notched bar (rebalanced toward optical center)
  <svg key="1" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path d="M7.5 6 A8 8 0 0 1 7.5 22 Z" fill="#F4F4F4" />
    <rect x="15.5" y="6.5" width="6.2" height="6.2" rx="0.8" fill="#F4F4F4" />
    <path d="M14.5 16.5 H21.5 L18 22.5 Z" fill="#9A9A9A" />
  </svg>,
  // ~fillux-dopyl — pinwheel of triangles
  <svg key="2" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path d="M14 6 L21 13 L14 13 Z" fill="#F4F4F4" />
    <path d="M22 14 L15 21 L15 14 Z" fill="#9A9A9A" />
    <path d="M14 22 L7 15 L14 15 Z" fill="#F4F4F4" />
    <path d="M6 14 L13 7 L13 14 Z" fill="#C8C8C8" />
  </svg>,
];

export function ShipSigil({ index }: { index: number }) {
  return (
    <Tile bg="#141414" ring="rgba(255,255,255,0.10)">
      {SIGILS[index % SIGILS.length]}
    </Tile>
  );
}
