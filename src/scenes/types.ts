import type { ComponentType } from "react";

/** X-friendly framing presets. Pixel sizes are the recorded video resolution. */
export type AspectId = "square" | "landscape" | "portrait";

export interface AspectPreset {
  id: AspectId;
  label: string;
  /** recorded video dimensions (also the on-screen stage size) */
  width: number;
  height: number;
}

export const ASPECTS: Record<AspectId, AspectPreset> = {
  square: { id: "square", label: "1:1", width: 1080, height: 1080 },
  landscape: { id: "landscape", label: "16:9", width: 1280, height: 720 },
  portrait: { id: "portrait", label: "9:16", width: 1080, height: 1920 },
};

/**
 * Props passed to every scene component.
 * `playing` is true while an autoplay loop is running (preview loop toggle or
 * the recorder). When false, the component is fully interactive for the user.
 * `loopKey` bumps on every loop restart so effects can re-run deterministically.
 */
export interface SceneProps {
  playing: boolean;
  loopKey: number;
}

export interface Scene {
  /** stable url-safe id, e.g. "copy-button" */
  id: string;
  title: string;
  /** one-line description shown in the gallery */
  blurb: string;
  /** the effect vocabulary this scene demonstrates (from animation-vocabulary) */
  tags: string[];
  /** framing for preview + recording */
  aspect: AspectId;
  /** seamless loop period in ms — the recorder captures exactly this window */
  loopMs: number;
  /** the interactive component */
  Component: ComponentType<SceneProps>;
}
