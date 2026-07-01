import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// self-hosted variable fonts — bundled, no network at record time
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

import App from "./App";
import { SCENES } from "./scenes/registry";
import { ASPECTS } from "./scenes/types";

// Manifest for the recorder (scripts/record.mjs) — the single source of truth
// for which scenes exist, their loop length, and their output dimensions.
window.__scenes = SCENES.map((s) => ({
  id: s.id,
  loopMs: s.loopMs,
  aspect: s.aspect,
  width: ASPECTS[s.aspect].width,
  height: ASPECTS[s.aspect].height,
}));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
