import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

import { useLoop } from "./app/useLoop";
import { scene } from "./scenes/search-portal/scene";

// Tight canvas that frames the ~800px component closely (vs the full 16:9
// recording canvas) so it renders large and usable in a side panel.
const CANVAS_W = 880;
const CANVAS_H = 640;

/**
 * Responsively scales the fixed-size component to fit the available space.
 * Uses a footprint-sized box with the canvas scaled from top-left, so the
 * scaled content is centered correctly with no overflow (unlike a
 * transform-origin:center scale of an oversized box).
 */
function FitBox({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(r.width / CANVAS_W, r.height / CANVAS_H, 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}>
        <div
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: 999,
        background: "#E2E2E2",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    />
  );
}

function Segmented({
  value,
  onChange,
}: {
  value: "interactive" | "loop";
  onChange: (v: "interactive" | "loop") => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 3,
        gap: 2,
        borderRadius: 11,
        background: "#F0F0F0",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      {(["interactive", "loop"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className="active:scale-[0.97]"
          style={{
            border: "none",
            cursor: "pointer",
            borderRadius: 8,
            padding: "5px 11px",
            fontSize: 12.5,
            fontWeight: 500,
            color: value === m ? "#111" : "#8A8A8A",
            background: value === m ? "#FFFFFF" : "transparent",
            boxShadow: value === m ? "0 1px 2px rgba(0,0,0,0.09)" : "none",
            transition: "transform 140ms var(--ease-out-strong)",
          }}
        >
          {m === "interactive" ? "Interactive" : "Demo loop"}
        </button>
      ))}
    </div>
  );
}

function Preview() {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        boxSizing: "border-box",
        background: "#ECECEC",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* browser-style window */}
      <div
        style={{
          width: "100%",
          height: "100%",
          minWidth: 0,
          maxWidth: 1000,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gridTemplateRows: "auto 1fr",
          borderRadius: 16,
          overflow: "hidden",
          background: "#FBFBFB",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* chrome bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 14px",
            background: "#F4F4F4",
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <Dot />
            <Dot />
            <Dot />
          </div>
          <div
            style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                maxWidth: 300,
                width: "100%",
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "6px 14px",
                borderRadius: 9,
                background: "#FFFFFF",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
                fontSize: 12.5,
                color: "#8A8A8A",
                fontFamily: "var(--font-mono)",
                letterSpacing: "-0.01em",
              }}
            >
              portal.studio / search-portal
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Segmented value={mode} onChange={setMode} />
            <button
              type="button"
              onClick={() => {
                setMode("interactive");
                setReplay((r) => r + 1);
              }}
              className="active:scale-[0.96]"
              title="Replay entrance"
              style={{
                borderRadius: 9,
                border: "none",
                background: "#111111",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "7px 12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "transform 140ms var(--ease-out-strong)",
              }}
            >
              Replay
            </button>
          </div>
        </div>

        {/* live component */}
        <div style={{ minWidth: 0, minHeight: 0, position: "relative", overflow: "hidden" }}>
          <FitBox>
            <scene.Component key={mountKey} playing={playing} loopKey={loopKey} />
          </FitBox>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
