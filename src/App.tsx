import { Gallery } from "@/app/Gallery";
import { SceneView } from "@/app/SceneView";
import { getScene } from "@/scenes/registry";

/**
 * Tiny query-param router — no dependency needed.
 *   /                       → gallery
 *   /?scene=copy-button     → interactive full view
 *   /?scene=copy-button&record=1 → chromeless recording view
 */
export default function App() {
  const params = new URLSearchParams(window.location.search);
  const scene = getScene(params.get("scene"));
  const record = params.get("record") === "1";

  if (scene) return <SceneView scene={scene} record={record} />;
  return <Gallery />;
}
