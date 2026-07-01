import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, ICON_MORPH, SPRING } from "@/lib/motion";
import type { Scene, SceneProps } from "@/scenes/types";

const SNIPPET = "npm i motion";
const REVERT_MS = 1400;

function CopyGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <rect
        x="8"
        y="8"
        width="14"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyButton({ playing, loopKey }: SceneProps) {
  const [copied, setCopied] = useState(false);
  const [pressed, setPressed] = useState(false);
  const revert = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doCopy = () => {
    // best-effort; clipboard may be unavailable in the recorder sandbox
    navigator.clipboard?.writeText(SNIPPET).catch(() => {});
    setCopied(true);
    if (revert.current) clearTimeout(revert.current);
    revert.current = setTimeout(() => setCopied(false), REVERT_MS);
  };

  // Autoplay: a scripted press → copy → revert timeline that returns to idle,
  // so the recorded window loops seamlessly. loopKey remounts on every restart.
  useEffect(() => {
    if (!playing) return;
    setCopied(false);
    setPressed(false);
    const timers = [
      setTimeout(() => setPressed(true), 620),
      setTimeout(() => {
        setPressed(false);
        setCopied(true);
      }, 760),
      setTimeout(() => setCopied(false), 760 + REVERT_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [playing, loopKey]);

  useEffect(() => () => void (revert.current && clearTimeout(revert.current)), []);

  return (
    <div className="flex flex-col items-center gap-9">
      <motion.button
        type="button"
        onPointerDown={() => !playing && setPressed(true)}
        onPointerUp={() => !playing && setPressed(false)}
        onPointerLeave={() => !playing && setPressed(false)}
        onClick={() => !playing && doCopy()}
        // color animates via motion (not CSS) so the deterministic recorder can drive it
        animate={{ scale: pressed ? 0.96 : 1, color: copied ? "#15803d" : "#16150f" }}
        transition={{
          scale: { duration: 0.14, ease: EASE.outStrong },
          color: { duration: 0.26, ease: EASE.outStrong },
        }}
        className="group flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-[19px] font-medium outline-none"
        style={{
          // layered transparent shadows — depth without a hard border (principle #3)
          boxShadow:
            "0 1px 2px rgba(16,15,15,0.06), 0 4px 12px rgba(16,15,15,0.06), inset 0 0 0 1px rgba(16,15,15,0.06)",
        }}
      >
        {/* icon box: fixed size so the swap never shifts layout */}
        <span className="relative grid size-5 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={copied ? "check" : "copy"}
              className="absolute inset-0 grid place-items-center"
              initial={ICON_MORPH.initial}
              animate={ICON_MORPH.animate}
              exit={ICON_MORPH.exit}
              transition={SPRING.morph}
            >
              {copied ? <CheckGlyph /> : <CopyGlyph />}
            </motion.span>
          </AnimatePresence>
        </span>

        {/* label: fixed width sized to the longer word so the pill never resizes */}
        <span className="relative grid h-6 w-[86px] place-items-start overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={copied ? "copied" : "copy-label"}
              className="absolute left-0 whitespace-nowrap"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={SPRING.morph}
            >
              {copied ? "Copied" : "Copy"}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>

      <code
        className="rounded-lg bg-black/[0.04] px-3 py-1.5 font-mono text-[15px] tracking-tight text-[color:var(--ink-soft)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {SNIPPET}
      </code>
    </div>
  );
}

export const scene: Scene = {
  id: "copy-button",
  title: "Copy button",
  blurb: "Icon morph, scale-on-press, and a crossfading label that never shifts.",
  tags: ["Icon morph", "Press feedback", "Crossfade", "Spring"],
  aspect: "landscape",
  loopMs: 3000,
  Component: CopyButton,
};
