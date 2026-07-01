import { useEffect, useState } from "react";
import { Stage } from "@/stage/Stage";
import { ASPECTS, type Scene } from "@/scenes/types";
import { publishBridge, signalReady } from "@/app/scene-bridge";

interface SceneViewProps {
  scene: Scene;
  /** true when opened by the recorder (?record=1): no chrome, exact pixels, autoplay */
  record: boolean;
}

export function SceneView({ scene, record }: SceneViewProps) {
  const aspect = ASPECTS[scene.aspect];
  const [loopKey, setLoopKey] = useState(0);
  // autoplay drives the scripted demo. On in record mode; toggled in preview.
  const [playing, setPlaying] = useState(record);

  // Recorder bridge + ready signal (record mode only).
  useEffect(() => {
    if (!record) return;
    publishBridge({ restart: () => setLoopKey((k) => k + 1), loopMs: scene.loopMs });
    signalReady();
  }, [record, scene.loopMs]);

  // Preview "loop" mode re-arms the scene every loopMs so it plays forever.
  useEffect(() => {
    if (record || !playing) return;
    const id = setInterval(() => setLoopKey((k) => k + 1), scene.loopMs);
    return () => clearInterval(id);
  }, [record, playing, scene.loopMs]);

  const stage = (
    <Stage
      width={aspect.width}
      height={aspect.height}
      fit={record ? "exact" : "contain"}
    >
      <scene.Component key={loopKey} playing={playing} loopKey={loopKey} />
    </Stage>
  );

  if (record) return <div className="h-full w-full">{stage}</div>;

  return (
    <div className="flex h-full w-full flex-col bg-[color:var(--canvas-2)]">
      <header className="flex items-center justify-between gap-4 px-5 py-3">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)]"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
            <path
              d="m15 18-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All components
        </a>
        <div className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
          <span className="tabular">{aspect.label}</span>
          <span aria-hidden>·</span>
          <span className="tabular">{scene.loopMs / 1000}s loop</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-6 pb-6">
        <div className="grid h-full place-items-center rounded-2xl">{stage}</div>
      </div>

      <footer className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-[15px] font-semibold">{scene.title}</h1>
          <p className="pretty text-sm text-[color:var(--ink-soft)]">{scene.blurb}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPlaying((p) => !p);
            setLoopKey((k) => k + 1);
          }}
          className="rounded-xl bg-[color:var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.96]"
          style={{ transitionTimingFunction: "var(--ease-out-strong)" }}
        >
          {playing ? "Stop loop" : "Play loop"}
        </button>
      </footer>
    </div>
  );
}
