import type { Transition } from "motion/react";

/**
 * Motion tokens shared across every scene.
 *
 * Values come straight from the design-engineering skills:
 *  - easing arrays are the "strong" custom curves (built-in CSS easings are too weak)
 *  - `bounce` is 0 for icon/state morphs (make-interfaces-feel-better #7)
 *  - keep UI durations under 300ms (emil-design-eng)
 */

// cubic-bezier control points, ready for `transition={{ ease: EASE.outStrong }}`
export const EASE = {
  outStrong: [0.23, 1, 0.32, 1],
  inOutStrong: [0.77, 0, 0.175, 1],
  drawer: [0.32, 0.72, 0, 1],
  /** gentle, understated ease-out for delicate entrances + subtle state changes */
  entrance: [0.25, 0.46, 0.45, 0.94],
  /** symmetric ease for fade-outs so exits don't vanish front-loaded/abruptly */
  exit: [0.45, 0, 0.55, 1],
} as const;

// Spring presets. Apple-style { duration, bounce } — easier to reason about.
export const SPRING = {
  /** icon + state morphs — never bounces (principle #7) */
  morph: { type: "spring", duration: 0.3, bounce: 0 },
  /** snappy press/response */
  snappy: { type: "spring", duration: 0.35, bounce: 0.1 },
  /** a touch of life for playful elements */
  lively: { type: "spring", duration: 0.5, bounce: 0.2 },
} satisfies Record<string, Transition>;

// The exact icon-morph keyframes from make-interfaces-feel-better #7.
export const ICON_MORPH = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: SPRING.morph,
} as const;
