import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

interface StageProps {
  width: number;
  height: number;
  children: ReactNode;
  /**
   * "exact" renders at true pixel size with no scaling — used by the recorder so
   * the browser viewport maps 1:1 to the output video. "contain" scales down to
   * fit the available space for on-screen preview.
   */
  fit?: "exact" | "contain";
}

/**
 * The minimal studio canvas. Soft off-white with a barely-there radial vignette
 * and a hairline frame — deliberately understated so the component is the star.
 */
export function Stage({ width, height, children, fit = "contain" }: StageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(fit === "exact" ? 1 : 0);

  useLayoutEffect(() => {
    if (fit === "exact") {
      setScale(1);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const { width: aw, height: ah } = el.getBoundingClientRect();
      setScale(Math.min(aw / width, ah / height, 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height, fit]);

  return (
    <div
      ref={wrapRef}
      className="grid h-full w-full place-items-center overflow-hidden"
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          background:
            "radial-gradient(120% 120% at 50% 30%, var(--canvas) 0%, var(--canvas-2) 100%)",
        }}
        className="relative grid shrink-0 place-items-center"
      >
        {/* hairline frame — a shadow, never a hard border (principle #3) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 1px var(--hairline)" }}
        />
        {children}
      </div>
    </div>
  );
}
