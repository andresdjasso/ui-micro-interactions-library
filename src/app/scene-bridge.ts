/**
 * The handshake the recorder (scripts/record.mjs) drives through Playwright.
 *
 *   1. wait for `document.body.dataset.ready === "1"`  (fonts + first paint done)
 *   2. call `window.__scene.restart()`                 (align the loop to t=0)
 *   3. wait one frame, then capture `window.__scene.loopMs` of video
 */
export interface SceneBridge {
  restart: () => void;
  loopMs: number;
}

/** Compact scene manifest the recorder reads to know what to capture. */
export interface SceneManifestEntry {
  id: string;
  loopMs: number;
  aspect: string;
  width: number;
  height: number;
}

declare global {
  interface Window {
    __scene?: SceneBridge;
    __scenes?: SceneManifestEntry[];
  }
}

export function publishBridge(bridge: SceneBridge) {
  window.__scene = bridge;
}

export function signalReady() {
  // Signal readiness once fonts are decoded. No rAF here — the deterministic
  // recorder drives a fake clock, so rAF would never fire on its own.
  const mark = () => {
    document.body.dataset.ready = "1";
  };
  if (document.fonts?.ready) {
    document.fonts.ready.then(mark);
  } else {
    mark();
  }
}
