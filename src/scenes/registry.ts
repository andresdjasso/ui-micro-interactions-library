import type { Scene } from "@/scenes/types";
import { scene as searchPortal } from "@/scenes/search-portal/scene";
import { scene as copyButton } from "@/scenes/copy-button/scene";

/**
 * Every showcase scene, in gallery order.
 * Add a new component by dropping a `scene.tsx` in `src/scenes/<id>/`
 * and appending it here.
 */
export const SCENES: Scene[] = [searchPortal, copyButton];

export const SCENES_BY_ID: Record<string, Scene> = Object.fromEntries(
  SCENES.map((s) => [s.id, s]),
);

export function getScene(id: string | null): Scene | undefined {
  return id ? SCENES_BY_ID[id] : undefined;
}
