import { Stage } from "@/stage/Stage";
import { ASPECTS, type Scene } from "@/scenes/types";
import { useLoop } from "@/app/useLoop";
import { SCENES } from "@/scenes/registry";

function CardPreview({ scene }: { scene: Scene }) {
  const aspect = ASPECTS[scene.aspect];
  const loopKey = useLoop(scene.loopMs);
  return (
    <div className="h-[280px] w-full">
      <Stage width={aspect.width} height={aspect.height} fit="contain">
        <scene.Component key={loopKey} playing loopKey={loopKey} />
      </Stage>
    </div>
  );
}

function Card({ scene }: { scene: Scene }) {
  return (
    <a
      href={`?scene=${scene.id}`}
      className="group block overflow-hidden rounded-3xl bg-white transition-transform duration-200 active:scale-[0.99]"
      style={{
        boxShadow:
          "0 1px 2px rgba(16,15,15,0.05), 0 8px 24px rgba(16,15,15,0.06), inset 0 0 0 1px rgba(16,15,15,0.05)",
        transitionTimingFunction: "var(--ease-out-strong)",
      }}
    >
      <div className="border-b border-black/[0.05] bg-[color:var(--canvas)]">
        <CardPreview scene={scene} />
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold">{scene.title}</h2>
          <span className="tabular text-xs text-[color:var(--ink-soft)]">
            {ASPECTS[scene.aspect].label}
          </span>
        </div>
        <p className="pretty text-sm leading-relaxed text-[color:var(--ink-soft)]">
          {scene.blurb}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {scene.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-[color:var(--ink-soft)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

export function Gallery() {
  return (
    <div className="min-h-full">
      <header className="mx-auto max-w-6xl px-6 pb-6 pt-14 sm:pt-20">
        <p className="text-sm font-medium tracking-wide text-[color:var(--ink-soft)]">
          UI MICRO-INTERACTIONS
        </p>
        <h1 className="balance mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          A studio for clean, interactive UI — built in real code, exported as
          looping video.
        </h1>
        <p className="pretty mt-3 max-w-xl text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
          Open any component to interact with it, or press{" "}
          <span className="font-medium text-[color:var(--ink)]">Play loop</span> to
          watch the recorded take. Run{" "}
          <code
            className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[13px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            npm run record
          </code>{" "}
          to render seamless MP4s for X.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SCENES.map((scene) => (
            <Card key={scene.id} scene={scene} />
          ))}
        </div>
      </main>
    </div>
  );
}
