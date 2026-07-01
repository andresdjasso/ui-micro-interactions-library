import { useState } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

import { Stage } from "./stage/Stage";
import { ASPECTS } from "./scenes/types";
import { useLoop } from "./app/useLoop";
import { scene } from "./scenes/search-portal/scene";

/**
 * Self-contained interactive preview of the Search Portal component.
 * Built with vite-plugin-singlefile so JS, CSS and fonts inline into one HTML.
 *   • Interactive — hover rows, click the search bar + type, press the ships.
 *   • Demo loop  — watch the scripted seamless take that gets recorded.
 */
function Preview() {
  const aspect = ASPECTS[scene.aspect];
  const [mode, setMode] = useState<"interactive" | "loop">("interactive");
  const [replay, setReplay] = useState(0);
  const loopKey = useLoop(scene.loopMs, mode === "loop");
  const playing = mode === "loop";
  const mountKey = mode === "loop" ? `loop-${loopKey}` : `int-${replay}`;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        gridTemplateRows: "1fr auto",
        background: "#FBFBFB",
      }}
    >
      <div style={{ minHeight: 0 }}>
        <Stage width={aspect.width} height={aspect.height} fit="contain">
          <scene.Component key={mountKey} playing={playing} loopKey={loopKey} />
        </Stage>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 18px",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "#9A9A9A",
        }}
      >
        {/* segmented mode toggle */}
        <div
          style={{
            display: "inline-flex",
            padding: 3,
            gap: 2,
            borderRadius: 12,
            background: "#F0F0F0",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {(["interactive", "loop"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="active:scale-[0.97]"
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 9,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                color: mode === m ? "#111" : "#8A8A8A",
                background: mode === m ? "#FFFFFF" : "transparent",
                boxShadow: mode === m ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                transition: "transform 140ms var(--ease-out-strong)",
              }}
            >
              {m === "interactive" ? "Interactive" : "Demo loop"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="pretty" style={{ maxWidth: 360, textAlign: "right" }}>
            {mode === "interactive"
              ? "Hover rows, click the bar + type, press the ships."
              : "Scripted seamless take — this is what gets recorded."}
          </span>
          {mode === "interactive" && (
            <button
              type="button"
              onClick={() => setReplay((r) => r + 1)}
              className="active:scale-[0.96]"
              style={{
                borderRadius: 10,
                border: "none",
                background: "#111111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                padding: "8px 12px",
                cursor: "pointer",
                transition: "transform 140ms var(--ease-out-strong)",
              }}
            >
              Replay entrance
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
